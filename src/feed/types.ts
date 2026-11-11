export interface FeedCardPalette {
  dominant?: string;
  accent?: string;
  background?: string;
}

export interface FeedCard {
  id: string;
  headline: string;
  summary: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  imageUrl: string;
  publishedAt: string;
  palette?: FeedCardPalette;
}

export interface FeedResponse {
  version?: string;
  generatedAt?: string;
  totalStories?: number;
  cards: FeedCard[];
}

export interface PostedRecord {
  storyId: string;
  headline: string;
  videoTitle: string;
  videoPath?: string;
  audioPath?: string;
  durationSeconds?: number;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  instagramMediaId?: string;
  postedAt: string;
}

export interface VideoScript {
  hook: string;
  corePoints: string[];
  cta: string;
  fullSpokenText: string;
  videoTitle: string;
  videoDescription: string;
  hashtags: string[];
}

export interface SubtitleWord {
  word: string;
  startMs: number;
  endMs: number;
}

