import type { SubtitleWord } from '../feed/types.js';

export interface CaptionChunk {
  text: string;
  startMs: number;
  endMs: number;
  words: SubtitleWord[];
}

/**
 * Groups raw word-level timestamps into short, high-retention phrases (2-4 words per card)
 * ideal for vertical short-form video reading.
 */
export function groupWordsIntoChunks(words: SubtitleWord[], maxWordsPerChunk: number = 3): CaptionChunk[] {
  if (words.length === 0) return [];

  const chunks: CaptionChunk[] = [];
  let currentGroup: SubtitleWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    currentGroup.push(word);

    const isPunctuationBreak = /[.!?]$/.test(word.word);
    const isLimitReached = currentGroup.length >= maxWordsPerChunk;
    const isLastWord = i === words.length - 1;

    if (isLimitReached || isPunctuationBreak || isLastWord) {
      const startMs = currentGroup[0].startMs;
      const endMs = currentGroup[currentGroup.length - 1].endMs;
      const text = currentGroup.map((w) => w.word).join(' ');

      chunks.push({
        text,
        startMs,
        endMs,
        words: [...currentGroup],
      });
      currentGroup = [];
    }
  }

  return chunks;
}
