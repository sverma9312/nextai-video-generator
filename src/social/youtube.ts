import fs from 'node:fs';
import fsp from 'node:fs/promises';
import type { SocialPublishRequest, PlatformPublishResult } from './types.js';

export async function uploadToYouTubeShorts(
  request: SocialPublishRequest
): Promise<PlatformPublishResult> {
  const isPublishEnabled = process.env.ENABLE_YOUTUBE_PUBLISH === 'true';
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  const privacyStatus = process.env.YOUTUBE_PRIVACY_STATUS || 'private';

  if (!isPublishEnabled) {
    console.log('🛡️ [YouTube Upload] Publishing is PAUSED (ENABLE_YOUTUBE_PUBLISH is not set to "true"). Skipping upload safely.');
    return {
      platform: 'youtube',
      success: false,
      skipped: true,
      error: 'Publishing paused by safety flag (ENABLE_YOUTUBE_PUBLISH=false).',
    };
  }

  if (!clientId || !clientSecret || !refreshToken) {
    console.log('ℹ️ [YouTube Upload] Missing YouTube OAuth2 credentials in .env. Skipping upload.');
    return {
      platform: 'youtube',
      success: false,
      skipped: true,
      error: 'YOUTUBE_CLIENT_ID / SECRET / REFRESH_TOKEN not set.',
    };
  }

  try {
    console.log('🔑 [YouTube Upload] Refreshing OAuth2 access token...');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Failed to refresh YouTube access token: HTTP ${tokenRes.status} ${errText}`);
    }

    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const stat = await fsp.stat(request.videoPath);
    const fileSize = stat.size;

    // Ensure title has #Shorts
    const titleWithShorts = request.title.includes('#Shorts')
      ? request.title
      : `${request.title} #Shorts`;

    const metadata = {
      snippet: {
        title: titleWithShorts,
        description: `${request.description}\n\n📱 Read the verified 60-word briefing: https://aishort.nextai-apps.com/\n\n${request.tags.join(' ')}`,
        tags: request.tags.map((t) => t.replace(/^#/, '')),
        categoryId: '28', // Science & Technology
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    };

    console.log('🚀 [YouTube Upload] Initiating resumable video session...');
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': String(fileSize),
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(`YouTube resumable initiation failed: HTTP ${initRes.status} ${errText}`);
    }

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('YouTube did not return a resumable upload Location header.');
    }

    console.log(`📤 [YouTube Upload] Uploading ${(fileSize / (1024 * 1024)).toFixed(1)}MB video...`);
    const fileStream = fs.createReadStream(request.videoPath);

    // Convert node read stream to Web ReadableStream
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(fileSize),
      },
      body: fs.readFileSync(request.videoPath),
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Video binary upload failed: HTTP ${uploadRes.status} ${errText}`);
    }

    const videoData = (await uploadRes.json()) as { id: string };
    const publishedUrl = `https://youtube.com/shorts/${videoData.id}`;
    console.log(`🎉 [YouTube Upload] Video successfully published: ${publishedUrl}`);

    // Auto-post top-level comment with app link
    try {
      console.log('💬 [YouTube Upload] Posting top-level comment...');
      const commentRes = await fetch(
        'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            snippet: {
              videoId: videoData.id,
              topLevelComment: {
                snippet: {
                  textOriginal: '📱 Read the full 60-word briefing & sources on AIShort:\n👉 https://aishort.nextai-apps.com/',
                },
              },
            },
          }),
        }
      );
      if (commentRes.ok) {
        console.log('✅ [YouTube Upload] Top comment posted successfully.');
      } else {
        const commentErr = await commentRes.text();
        console.warn('⚠️ [YouTube Upload] Could not post comment (non-fatal):', commentErr);
      }
    } catch (commentErr: any) {
      console.warn('⚠️ [YouTube Upload] Could not post comment (non-fatal):', commentErr.message);
    }

    return {
      platform: 'youtube',
      success: true,
      id: videoData.id,
      publishedUrl,
    };
  } catch (err: any) {
    console.error('❌ [YouTube Upload] Error uploading video to YouTube:', err.message);
    return {
      platform: 'youtube',
      success: false,
      error: err.message,
    };
  }
}

