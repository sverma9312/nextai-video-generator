import { uploadToYouTubeShorts } from './youtube.js';
import { uploadToInstagramReels } from './instagram.js';
import type { SocialPublishRequest, AggregatePublishResult, PlatformPublishResult } from './types.js';

export interface PublishChannelOptions {
  skipYouTube?: boolean;
  skipInstagram?: boolean;
}

export async function publishToAllChannels(
  request: SocialPublishRequest,
  publicHostedVideoUrl?: string,
  options?: PublishChannelOptions
): Promise<AggregatePublishResult> {
  console.log('\n📣 [Social Publisher] Starting distribution across platforms...');

  const ytPromise: Promise<PlatformPublishResult> = options?.skipYouTube
    ? Promise.resolve({
        platform: 'youtube' as const,
        success: true,
        skipped: true,
        error: 'Skipped (already published or not requested).',
      })
    : uploadToYouTubeShorts(request);

  const igPromise: Promise<PlatformPublishResult> = options?.skipInstagram
    ? Promise.resolve({
        platform: 'instagram' as const,
        success: true,
        skipped: true,
        error: 'Skipped (already published or not requested).',
      })
    : uploadToInstagramReels(request, publicHostedVideoUrl);

  const [ytResult, igResult] = await Promise.all([ytPromise, igPromise]);

  return {
    youtube: ytResult,
    instagram: igResult,
  };
}

