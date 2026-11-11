import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FeedCard, VideoScript } from '../feed/types.js';
import { buildScriptPrompt } from './prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function generateVideoScript(card: FeedCard): Promise<VideoScript> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment or .env file.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildScriptPrompt(card);

  const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let lastError: Error | null = null;
  let response: any = null;

  for (const model of candidateModels) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
      if (response && response.text) {
        break;
      }
    } catch (err: any) {
      console.warn(`[ScriptGenerator] Model ${model} failed: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  if (!response || !response.text) {
    throw new Error(`All candidate script models failed: ${lastError?.message || 'Empty response'}`);
  }

  const text = response.text.trim();

  try {
    const parsed = JSON.parse(text) as VideoScript;
    if (!parsed.hook || !parsed.fullSpokenText || !parsed.videoTitle) {
      throw new Error('Gemini response missing required script fields.');
    }

    // Ensure clean spoken text (strip any accidental asterisks, emojis, or markdown)
    parsed.fullSpokenText = parsed.fullSpokenText
      .replace(/[*_#`~[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return parsed;
  } catch (err: any) {
    throw new Error(`Failed to parse Gemini script output as JSON: ${err.message}. Raw: ${text}`);
  }
}

// Self-executing test for Phase 2 verification
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  (async () => {
    try {
      console.log('🤖 [Phase 2 Test] Generating viral video script via Gemini 2.5 Flash...\n');
      const testCard: FeedCard = {
        id: 'test-card-1',
        headline: 'AlphaGenome 2 predicts DNA variant effects in individual cell types',
        category: 'models',
        sourceName: 'Google DeepMind',
        sourceUrl: 'https://deepmind.google/blog',
        imageUrl: 'https://lh3.googleusercontent.com/...',
        publishedAt: new Date().toISOString(),
        summary: 'Google DeepMind announced AlphaGenome 2, a model that predicts how DNA variants affect gene expression in specific human cell types. Trained on over 100 million single-cell profiles across 68 tissues, it identifies nearly twice as many causal variants as its predecessor, aiding disease research.',
      };

      const script = await generateVideoScript(testCard);
      console.log('✅ Generated Video Script:');
      console.log(`   Title:         ${script.videoTitle}`);
      console.log(`   Hook:          "${script.hook}"`);
      console.log(`   Core Points:   ${JSON.stringify(script.corePoints, null, 2)}`);
      console.log(`   CTA:           "${script.cta}"`);
      console.log(`   Spoken Text:   "${script.fullSpokenText}"`);
      console.log(`   Word Count:    ${script.fullSpokenText.split(/\s+/).length} words`);
      console.log(`   Hashtags:      ${script.hashtags.join(' ')}\n`);
      console.log('🎯 Phase 2 Script Synthesis: PASSED');
    } catch (err: any) {
      console.error('❌ Phase 2 Test Failed:', err.message);
      process.exit(1);
    }
  })();
}
