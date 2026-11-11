import type { FeedCard, FeedResponse } from './types.js';

export const AISHOOT_FEED_URL = 'https://aishort.nextai-apps.com/v1/feed/latest.json';

export async function fetchLatestFeed(url: string = AISHOOT_FEED_URL): Promise<FeedCard[]> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextAIVideoGenerator/1.0 (+https://github.com/sverma9312/nextai-video-generator)',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AIShort feed: HTTP ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as FeedResponse;

    if (!data || !Array.isArray(data.cards)) {
      throw new Error(`Malformed AIShort feed payload: missing "cards" array.`);
    }

    // Filter valid cards
    const validCards = data.cards.filter((card) => {
      return (
        typeof card.id === 'string' &&
        card.id.trim().length > 0 &&
        typeof card.headline === 'string' &&
        card.headline.trim().length > 0 &&
        typeof card.summary === 'string' &&
        card.summary.trim().length > 0 &&
        typeof card.imageUrl === 'string' &&
        card.imageUrl.startsWith('http')
      );
    });

    return validCards;
  } catch (error: any) {
    throw new Error(`Error fetching AIShort news feed: ${error.message}`);
  }
}

