import { fetchLatestFeed } from './consumer.js';
import { getPostedArchive } from './archive.js';
import type { FeedCard } from './types.js';

export interface SelectionOptions {
  forceLatest?: boolean;
  storyId?: string;
  searchQuery?: string;
  categoryPreference?: string[];
}

export function scoreCard(card: FeedCard): number {
  let score = 0;

  // Category prioritization (consumer, products, tools, productivity are high virality)
  const cat = (card.category || '').toLowerCase();
  const text = (card.headline + ' ' + card.summary).toLowerCase();

  if (cat.includes('product') || text.includes('meeting') || text.includes('office') || text.includes('tool') || text.includes('sheets') || text.includes('workspace')) {
    score += 35; // Viral consumer & workplace impact
  } else if (cat.includes('model') || cat.includes('llm')) {
    score += 25;
  } else if (cat.includes('research') || cat.includes('breakthrough')) {
    score += 20;
  } else {
    score += 10;
  }

  // Visual quality bonus
  if (card.imageUrl && card.imageUrl.startsWith('https://')) {
    score += 10;
  }

  // Summary length bonus (ideally punchy around 40-70 words)
  const wordCount = card.summary.split(/\s+/).length;
  if (wordCount >= 40 && wordCount <= 75) {
    score += 10;
  }

  return score;
}

export async function selectStoryForVideo(options: SelectionOptions = {}): Promise<FeedCard> {
  const cards = await fetchLatestFeed();
  if (cards.length === 0) {
    throw new Error('No valid news cards found in AIShort feed.');
  }

  // If a specific story ID was requested, return it directly
  if (options.storyId) {
    const directMatch = cards.find((c) => c.id === options.storyId);
    if (directMatch) {
      return directMatch;
    }
    throw new Error(
      `Requested story ID "${options.storyId}" was not found in the AIShort feed (100 latest stories).`
    );
  }

  // If a search query or headline was requested, find the best matching story
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    // Strip accidental wrapping quotes (e.g. "ChatGPT Wallet" or 'ChatGPT Wallet')
    const cleanQuery = options.searchQuery.replace(/^["']|["']$/g, '').trim();
    const q = cleanQuery.toLowerCase();
    const queryTerms = q.split(/\s+/).filter((t) => t.length > 1);

    // 1. Exact phrase match in headline
    const exactHeadlineMatch = cards.find((c) => c.headline.toLowerCase().includes(q));
    if (exactHeadlineMatch) {
      console.log(`🎯 Found exact headline match for "${cleanQuery}": "${exactHeadlineMatch.headline}"`);
      return exactHeadlineMatch;
    }

    // 2. All search terms match across headline
    const allTermsHeadline = cards.find((c) => {
      const h = c.headline.toLowerCase();
      return queryTerms.every((term) => h.includes(term));
    });
    if (allTermsHeadline) {
      console.log(`🎯 Found all-keyword headline match for "${cleanQuery}": "${allTermsHeadline.headline}"`);
      return allTermsHeadline;
    }

    // 3. All search terms match across headline and summary
    const allTermsMatch = cards.find((c) => {
      const full = `${c.headline} ${c.summary} ${c.category} ${c.sourceName}`.toLowerCase();
      return queryTerms.every((term) => full.includes(term));
    });
    if (allTermsMatch) {
      console.log(`🎯 Found full keyword match for "${cleanQuery}": "${allTermsMatch.headline}"`);
      return allTermsMatch;
    }

    // 4. Any major search term matches (ranked by term count)
    const scoredMatches = cards
      .map((c) => {
        const full = `${c.headline} ${c.summary}`.toLowerCase();
        const matchCount = queryTerms.filter((term) => full.includes(term)).length;
        const headlineBonus = queryTerms.some((term) => c.headline.toLowerCase().includes(term)) ? 2 : 0;
        return { card: c, score: matchCount + headlineBonus };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scoredMatches.length > 0) {
      const best = scoredMatches[0].card;
      console.log(`🎯 Found best relevant match for "${cleanQuery}": "${best.headline}"`);
      return best;
    }

    const sampleHeadlines = cards.slice(0, 5).map((c) => `   • "${c.headline}"`).join('\n');
    throw new Error(
      `No news story matching search query "${cleanQuery}" was found in the AIShort feed (100 latest stories).\n\n` +
      `Recent headlines available in feed:\n${sampleHeadlines}\n\n` +
      `Tip: Try a shorter keyword (e.g. "ChatGPT", "Wallet", "OpenAI") or visit https://aishort.nextai-apps.com to check the live headlines.`
    );
  }

  const archive = await getPostedArchive();
  const postedIds = new Set(archive.map((r) => r.storyId));

  // Filter unposted cards
  let candidates = cards.filter((c) => !postedIds.has(c.id));

  if (candidates.length === 0) {
    if (options.forceLatest) {
      console.warn('⚠️ All stories have been posted. Force-selecting the most recent story.');
      candidates = [cards[0]];
    } else {
      throw new Error(`All ${cards.length} stories in the AIShort feed have already been posted! Add new stories to AIShort or pass forceLatest: true.`);
    }
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => scoreCard(b) - scoreCard(a));

  return candidates[0];
}

import { pathToFileURL } from 'node:url';

// Self-executing CLI test for Phase 1 verification
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  (async () => {
    try {
      console.log('🔍 [Phase 1 Test] Fetching AIShort live feed and testing story selection...\n');
      const selected = await selectStoryForVideo({ forceLatest: true });

      console.log('✅ Story Selected Successfully:');
      console.log(`   ID:          ${selected.id}`);
      console.log(`   Headline:    ${selected.headline}`);
      console.log(`   Category:    ${selected.category}`);
      console.log(`   Source:      ${selected.sourceName} (${selected.sourceUrl})`);
      console.log(`   Image:       ${selected.imageUrl}`);
      console.log(`   Summary:     ${selected.summary}\n`);
      console.log('🎯 Phase 1 Ingestion & Story Selection: PASSED');
    } catch (err: any) {
      console.error('❌ Phase 1 Test Failed:', err.message);
      process.exit(1);
    }
  })();
}

