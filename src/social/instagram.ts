import type { SocialPublishRequest, PlatformPublishResult } from './types.js';

export async function uploadToInstagramReels(
  request: SocialPublishRequest,
  publicHostedVideoUrl?: string
): Promise<PlatformPublishResult> {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    console.log('ℹ️ [Instagram Upload] Missing INSTAGRAM_ACCOUNT_ID or ACCESS_TOKEN in .env. Skipping upload.');
    return {
      platform: 'instagram',
      success: false,
      skipped: true,
      error: 'INSTAGRAM_ACCOUNT_ID / ACCESS_TOKEN not configured.',
    };
  }

  // Meta Graph API requires a publicly reachable HTTPS URL for video ingestion
  if (!publicHostedVideoUrl) {
    console.log('ℹ️ [Instagram Upload] Instagram Reels requires a public video URL (from GitHub release or CDN). Skipping direct upload.');
    return {
      platform: 'instagram',
      success: false,
      skipped: true,
      error: 'No public video URL available for Meta Graph API container creation.',
    };
  }

  try {
    console.log('📸 [Instagram Upload] Creating Reels container via Meta Graph API...');
    const caption = `${request.title}\n\n${request.description}\n\n📱 Read the 60-word briefing: https://aishort.nextai-apps.com/\n\n${request.tags.join(' ')}`;

    const containerUrl = `https://graph.facebook.com/v19.0/${accountId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: publicHostedVideoUrl,
        caption,
        access_token: accessToken,
      }),
    });

    if (!containerRes.ok) {
      const errText = await containerRes.text();
      throw new Error(`Failed to create Instagram container: HTTP ${containerRes.status} ${errText}`);
    }

    const { id: containerId } = (await containerRes.json()) as { id: string };

    // Poll container processing status (max 60 seconds)
    console.log(`⏳ [Instagram Upload] Waiting for media container ${containerId} to finish processing...`);
    let isFinished = false;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(
        `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
      );
      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as { status_code: string };
        if (statusData.status_code === 'FINISHED') {
          isFinished = true;
          break;
        } else if (statusData.status_code === 'ERROR') {
          throw new Error('Instagram media container processing returned status ERROR.');
        }
      }
    }

    if (!isFinished) {
      throw new Error('Timed out waiting for Instagram Reels container processing.');
    }

    // Publish container
    console.log('🚀 [Instagram Upload] Publishing media container...');
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    });

    if (!publishRes.ok) {
      const errText = await publishRes.text();
      throw new Error(`Failed to publish Instagram media: HTTP ${publishRes.status} ${errText}`);
    }

    const { id: publishedMediaId } = (await publishRes.json()) as { id: string };
    console.log(`🎉 [Instagram Upload] Reel published successfully with ID: ${publishedMediaId}`);

    return {
      platform: 'instagram',
      success: true,
      id: publishedMediaId,
    };
  } catch (err: any) {
    console.error('❌ [Instagram Upload] Error publishing to Instagram:', err.message);
    return {
      platform: 'instagram',
      success: false,
      error: err.message,
    };
  }
}
