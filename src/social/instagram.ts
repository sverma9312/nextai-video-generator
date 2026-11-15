import fsp from 'node:fs/promises';
import path from 'node:path';
import type { SocialPublishRequest, PlatformPublishResult } from './types.js';

/**
 * Uploads a video file to an ephemeral public CDN to obtain a publicly accessible direct download URL.
 * Meta Graph API (Instagram Reels) requires a publicly accessible HTTPS URL for Method A ingestion.
 * Tries Uguu.se first (direct raw MP4 link, 3-hour retention), then Tmpfiles.org as secondary fallback.
 */
async function uploadToEphemeralCdn(filePath: string): Promise<string> {
  const fileName = path.basename(filePath);
  const fileBuffer = await fsp.readFile(filePath);

  // Strategy 1: Uguu.se (fast, direct raw MP4 link, 3-hour retention)
  try {
    console.log('🌐 [Ephemeral CDN] Uploading video to primary host (uguu.se)...');
    const form = new FormData();
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });
    form.append('files[]', blob, fileName);

    const res = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(45000),
    });

    if (res.ok) {
      const data = (await res.json()) as { success: boolean; files?: Array<{ url: string }> };
      if (data.success && data.files?.[0]?.url) {
        console.log(`✅ [Ephemeral CDN] Primary host upload succeeded: ${data.files[0].url}`);
        return data.files[0].url;
      }
    }
    console.warn(`⚠️ [Ephemeral CDN] Primary host returned HTTP ${res.status}`);
  } catch (err: any) {
    console.warn(`⚠️ [Ephemeral CDN] Primary host failed: ${err.message}`);
  }

  // Strategy 2: Tmpfiles.org (fallback, 60 min retention)
  try {
    console.log('🌐 [Ephemeral CDN] Trying fallback host (tmpfiles.org)...');
    const form = new FormData();
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });
    form.append('file', blob, fileName);

    const res = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(60000),
    });

    if (res.ok) {
      const data = (await res.json()) as { status: string; data?: { url: string } };
      if (data.status === 'success' && data.data?.url) {
        const landingUrl = data.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
        const pageRes = await fetch(landingUrl, { signal: AbortSignal.timeout(15000) });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const match = html.match(/class="download" href="([^"]+)"/);
          if (match && match[1]) {
            console.log(`✅ [Ephemeral CDN] Fallback host direct URL resolved: ${match[1]}`);
            return match[1];
          }
        }
        console.log(`✅ [Ephemeral CDN] Fallback host URL: ${landingUrl}`);
        return landingUrl;
      }
    }
    console.warn(`⚠️ [Ephemeral CDN] Fallback host returned HTTP ${res.status}`);
  } catch (err: any) {
    console.warn(`⚠️ [Ephemeral CDN] Fallback host failed: ${err.message}`);
  }

  throw new Error('All ephemeral CDN uploads failed.');
}

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
    console.error('❌ [Instagram Upload] Missing Instagram credentials in environment (INSTAGRAM_ACCOUNT_ID / ACCESS_TOKEN).');
    return {
      platform: 'instagram',
      success: false,
      skipped: false,
      error: 'INSTAGRAM_ACCOUNT_ID / ACCESS_TOKEN not configured.',
    };
  }

  try {
    const cleanTopic = (request.topic || request.title).replace(/#Shorts/gi, '').trim();
    const sourceLine = request.sourceName ? `\n🏢 Source: ${request.sourceName}` : '';
    const formattedTags = (request.tags || [])
      .map((t) => (t.startsWith('#') ? t : `#${t.replace(/\s+/g, '')}`))
      .join(' ');

    const caption = [
      `📰 Topic: ${cleanTopic}${sourceLine}`,
      '',
      request.description || cleanTopic,
      '',
      '📱 Read the verified 60-word briefing on AIShort:',
      '👉 https://aishort.nextai-apps.com/',
      '',
      formattedTags,
    ]
      .filter((line) => line !== undefined && line !== null)
      .join('\n');

    let videoUrl = publicHostedVideoUrl || process.env.PUBLIC_VIDEO_URL;

    // If no public URL is provided, upload to ephemeral CDN for Method A URL ingestion
    if (!videoUrl) {
      try {
        videoUrl = await uploadToEphemeralCdn(request.videoPath);
      } catch (cdnErr: any) {
        console.warn(`⚠️ [Instagram Upload] Ephemeral CDN upload failed: ${cdnErr.message}. Will attempt direct resumable upload as fallback.`);
      }
    }

    let containerId: string;

    if (videoUrl) {
      // Method A: Ingest via publicly reachable URL (100% reliable on Meta)
      console.log(`📸 [Instagram Upload] Creating Reels container via public URL (${videoUrl})...`);
      const containerUrl = `https://graph.facebook.com/v19.0/${accountId}/media`;
      const containerRes = await fetch(containerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: videoUrl,
          caption,
          access_token: accessToken,
        }),
      });

      if (!containerRes.ok) {
        const errText = await containerRes.text();
        throw new Error(`Failed to create Instagram container via URL ingestion: HTTP ${containerRes.status} ${errText}`);
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
          'Content-Length': fileSize.toString(),
          'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Failed to upload video bytes to Meta: HTTP ${uploadRes.status} ${errText}`);
      }

      console.log('✅ [Instagram Upload] Video bytes uploaded successfully to Meta.');
    }

    // Poll container processing status (max 150 seconds)
    console.log(`⏳ [Instagram Upload] Waiting for media container ${containerId} to finish processing...`);
    let isFinished = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(
        `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
      );
      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as { status_code: string; status?: string };
        console.log(`   Status: ${statusData.status_code} (${(i + 1) * 5}s)${statusData.status ? ` - ${statusData.status}` : ''}`);
        if (statusData.status_code === 'FINISHED') {
          isFinished = true;
          break;
        } else if (statusData.status_code === 'ERROR') {
          throw new Error(`Instagram media container processing returned ERROR: ${statusData.status || 'unknown processing error'}`);
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
