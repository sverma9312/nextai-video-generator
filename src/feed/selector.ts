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
    console.warn(`⚠️ Requested story ID "${options.storyId}" not found in feed. Falling back to scoring.`);
  }

  // If a search query or headline was requested, find the best matching story
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const q = options.searchQuery.toLowerCase().trim();
    const queryTerms = q.split(/\s+/).filter((t) => t.length > 1);

    // 1. Exact headline or phrase match
    const exactMatch = cards.find((c) => c.headline.toLowerCase().includes(q));
    if (exactMatch) {
      console.log(`🎯 Found exact headline match for "${options.searchQuery}": "${exactMatch.headline}"`);
      return exactMatch;
    }

    // 2. All terms match across headline and summary
    const allTermsMatch = cards.find((c) => {
      const full = `${c.headline} ${c.summary} ${c.category} ${c.sourceName}`.toLowerCase();
      return queryTerms.every((term) => full.includes(term));
    });
    if (allTermsMatch) {
      console.log(`🎯 Found full keyword match for "${options.searchQuery}": "${allTermsMatch.headline}"`);
      return allTermsMatch;
    }

    // 3. Partial terms match
    const partialMatch = cards.find((c) => {
      const full = `${c.headline} ${c.summary}`.toLowerCase();
      return queryTerms.some((term) => full.includes(term));
    });
    if (partialMatch) {
      console.log(`🎯 Found partial match for "${options.searchQuery}": "${partialMatch.headline}"`);
      return partialMatch;
    }

    console.warn(`⚠️ No story matched "${options.searchQuery}" in feed. Falling back to scoring.`);
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

