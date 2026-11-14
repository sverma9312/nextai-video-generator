import fsp from 'node:fs/promises';
import type { SocialPublishRequest, PlatformPublishResult } from './types.js';

export async function uploadToInstagramReels(
  request: SocialPublishRequest,
  publicHostedVideoUrl?: string
): Promise<PlatformPublishResult> {
  const isPublishEnabled = process.env.ENABLE_INSTAGRAM_PUBLISH === 'true';
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!isPublishEnabled) {
    console.log('🛡️ [Instagram Upload] Publishing is PAUSED (ENABLE_INSTAGRAM_PUBLISH is not set to "true"). Skipping upload safely.');
    return {
      platform: 'instagram',
      success: false,
      skipped: true,
      error: 'Publishing paused by safety flag (ENABLE_INSTAGRAM_PUBLISH=false).',
    };
  }

  if (!accountId || !accessToken) {
    console.log('ℹ️ [Instagram Upload] Missing INSTAGRAM_ACCOUNT_ID or ACCESS_TOKEN in .env. Skipping upload.');
    return {
      platform: 'instagram',
      success: false,
      skipped: true,
      error: 'INSTAGRAM_ACCOUNT_ID / ACCESS_TOKEN not configured.',
    };
  }

  try {
    const cleanTopic = (request.topic || request.title).replace(/#Shorts/gi, '').trim();
    // Meta rupload (rupload.facebook.com) chokes on newlines and '#' characters in container initialization headers,
    // which triggers an immediate ProcessingFailedError (HTTP 400).
    // Keep the container caption safe, single-line, and under 200 chars.
    let caption = `${cleanTopic}. Read the verified 60-word briefing on AIShort: https://aishort.nextai-apps.com/`;
    if (caption.length > 200) {
      const truncatedTopic = cleanTopic.slice(0, 110) + '...';
      caption = `${truncatedTopic} Read the briefing on AIShort: https://aishort.nextai-apps.com/`;
    }

    let containerId: string;

    if (publicHostedVideoUrl) {
      // Method A: Ingest via publicly reachable URL
      console.log('📸 [Instagram Upload] Creating Reels container via public URL...');
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

      const { id } = (await containerRes.json()) as { id: string };
      containerId = id;
    } else {
      // Method B: Direct Resumable Binary Upload from local disk
      console.log('📸 [Instagram Upload] Initializing direct binary Reels upload session...');
      const stat = await fsp.stat(request.videoPath);
      const fileSize = stat.size;

      const initUrl = `https://graph.facebook.com/v19.0/${accountId}/media`;
      const initRes = await fetch(initUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          upload_type: 'resumable',
          caption,
          access_token: accessToken,
        }),
      });

      if (!initRes.ok) {
        const errText = await initRes.text();
        throw new Error(`Failed to initialize direct Instagram upload session: HTTP ${initRes.status} ${errText}`);
      }

      const initData = (await initRes.json()) as { id: string; uri?: string };
      containerId = initData.id;
      const uploadUri = initData.uri || `https://rupload.facebook.com/ig-reels-upload/v19.0/${containerId}`;

      console.log(`📤 [Instagram Upload] Uploading video binary (${(fileSize / (1024 * 1024)).toFixed(2)} MB)...`);
      const fileBuffer = await fsp.readFile(request.videoPath);

      const uploadRes = await fetch(uploadUri, {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${accessToken}`,
          offset: '0',
          file_size: fileSize.toString(),
        },
        body: fileBuffer,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Failed to upload video bytes to Meta: HTTP ${uploadRes.status} ${errText}`);
      }

      console.log('✅ [Instagram Upload] Video bytes uploaded successfully to Meta.');
    }

    // Poll container processing status (max 90 seconds)
    console.log(`⏳ [Instagram Upload] Waiting for media container ${containerId} to finish processing...`);
    let isFinished = false;
    for (let i = 0; i < 18; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(
        `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
      );
      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as { status_code: string };
        console.log(`   Status: ${statusData.status_code} (${(i + 1) * 5}s)`);
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

    // Fetch permalink for reporting
    let permalink: string | undefined;
    try {
      const permalinkRes = await fetch(
        `https://graph.facebook.com/v19.0/${publishedMediaId}?fields=permalink&access_token=${accessToken}`
      );
      if (permalinkRes.ok) {
        const pData = (await permalinkRes.json()) as { permalink?: string };
        permalink = pData.permalink;
      }
    } catch {
      // Non-fatal
    }

    console.log(`🎉 [Instagram Upload] Reel published successfully!`);
    console.log(`   Reel ID:   ${publishedMediaId}`);
    if (permalink) {
      console.log(`   Permalink: ${permalink}`);
    }

    return {
      platform: 'instagram',
      success: true,
      id: publishedMediaId,
      publishedUrl: permalink,
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
