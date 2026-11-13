import type { FeedCard, VideoScript, SubtitleWord } from '../feed/types.js';

export interface VideoCompositionProps {
  [key: string]: unknown;
  story: FeedCard;
  script: VideoScript;
  audioSrc: string;
  words: SubtitleWord[];
  durationInFrames: number;
}

