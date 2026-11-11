import { uploadToYouTubeShorts } from './youtube.js';
import { uploadToInstagramReels } from './instagram.js';
import type { SocialPublishRequest, AggregatePublishResult } from './types.js';

export async function publishToAllChannels(
  request: SocialPublishRequest,
  publicHostedVideoUrl?: string
): Promise<AggregatePublishResult> {
  console.log('\n📣 [Social Publisher] Starting distribution across platforms...');

  const [ytResult, igResult] = await Promise.all([
    uploadToYouTubeShorts(request),
    uploadToInstagramReels(request, publicHostedVideoUrl),
  ]);

  return {
    youtube: ytResult,
    instagram: igResult,
  };
}

