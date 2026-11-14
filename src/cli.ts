import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { selectStoryForVideo } from './feed/selector.js';
import { generateVideoScript } from './script/generator.js';
import { synthesizeVoiceover } from './audio/tts.js';
import { renderVideoToDisk } from './render/renderer.js';
import { getPostedArchive, recordPostedStory } from './feed/archive.js';
import { publishToAllChannels } from './social/publisher.js';
import type { VideoCompositionProps } from './video/types.js';
import type { FeedCard } from './feed/types.js';

export async function runPipeline(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
  const isForce = args.includes('--force') || process.env.FORCE_RUN === 'true';
  const isNoPublish = args.includes('--no-publish');
  const isRetryLast = args.includes('--retry-last') || process.env.RETRY_LAST === 'true';

  const storyIdIdx = args.indexOf('--story-id');
  let targetStoryId = storyIdIdx !== -1 && args[storyIdIdx + 1] ? args[storyIdIdx + 1] : undefined;
  if (!targetStoryId && process.env.STORY_ID) {
    targetStoryId = process.env.STORY_ID.trim();
  }

  const searchIdx = args.indexOf('--search');
  let targetSearch: string | undefined;
  if (searchIdx !== -1) {
    const searchTerms: string[] = [];
    for (let i = searchIdx + 1; i < args.length; i++) {
      if (args[i].startsWith('--')) break;
      const clean = args[i].replace(/^["']|["']$/g, '').trim();
      if (clean) searchTerms.push(clean);
    }
    if (searchTerms.length > 0) {
      targetSearch = searchTerms.join(' ').trim();
    }
  }
  if (!targetSearch && process.env.SEARCH_QUERY && process.env.SEARCH_QUERY.trim().length > 0) {
    targetSearch = process.env.SEARCH_QUERY.replace(/^["']|["']$/g, '').trim();
  }

  console.log('====================================================');
  console.log('🚀 NextAI Video Generator — Autonomous Daily Pipeline');
  console.log(`   Mode: ${isRetryLast ? 'RETRY LAST VIDEO' : isDryRun ? 'DRY-RUN (No MP4 Render)' : 'FULL RENDER'}`);
  if (targetStoryId) {
    console.log(`   Target Story ID: ${targetStoryId}`);
  }
  if (targetSearch) {
    console.log(`   Search Query:    "${targetSearch}"`);
  }
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('====================================================\n');

  // --- RETRY LAST VIDEO MODE ---
  if (isRetryLast) {
    console.log('🔄 [Retry Mode] Checking posted archive ledger...');
    const archive = await getPostedArchive();
    if (archive.length === 0) {
      throw new Error('No stories found in posted archive ledger to retry.');
    }

    const targetRecord = targetStoryId
      ? archive.find((r) => r.storyId === targetStoryId)
      : archive[0];

    if (!targetRecord) {
      throw new Error(`Target story ID "${targetStoryId}" not found in posted archive ledger.`);
    }

    console.log(`   Target Story: "${targetRecord.headline}" (ID: ${targetRecord.storyId})`);
    console.log(`   YouTube URL:   ${targetRecord.youtubeUrl || 'NOT PUBLISHED'}`);
    console.log(`   Instagram URL: ${targetRecord.instagramUrl || 'NOT PUBLISHED'}\n`);

    const isPublishYouTube = process.env.ENABLE_YOUTUBE_PUBLISH === 'true' && !isNoPublish;
    const isPublishInstagram = process.env.ENABLE_INSTAGRAM_PUBLISH === 'true' && !isNoPublish;

    const needYouTube = isPublishYouTube && (!targetRecord.youtubeUrl || isForce);
    const needInstagram = isPublishInstagram && (!targetRecord.instagramUrl || isForce);

    if (isPublishYouTube && targetRecord.youtubeUrl && !isForce) {
      console.log(`ℹ️ [YouTube] Already published at ${targetRecord.youtubeUrl}. Skipping (pass force=true to override).`);
    }
    if (isPublishInstagram && targetRecord.instagramUrl && !isForce) {
      console.log(`ℹ️ [Instagram] Already published at ${targetRecord.instagramUrl}. Skipping (pass force=true to override).`);
    }

    if (!needYouTube && !needInstagram) {
      console.log('\n✨ [Retry Complete] All requested platforms are already published for this story.');
      console.log('   Nothing to retry. Exiting safely without re-rendering.');
      return;
    }

    // Check if MP4 already exists on disk
    let videoPathToPublish: string | null = null;
    const defaultOutPath = path.resolve(process.cwd(), 'out', `${targetRecord.storyId}.mp4`);
    if (fs.existsSync(defaultOutPath)) {
      videoPathToPublish = defaultOutPath;
    } else if (targetRecord.videoPath && fs.existsSync(targetRecord.videoPath)) {
      videoPathToPublish = targetRecord.videoPath;
    }

    let story: FeedCard;
    try {
      story = await selectStoryForVideo({ storyId: targetRecord.storyId, forceLatest: true });
    } catch {
      story = {
        id: targetRecord.storyId,
        headline: targetRecord.headline,
        summary: targetRecord.headline,
        category: 'AI Breakthrough',
        sourceName: 'AIShort News',
        sourceUrl: 'https://aishort.nextai-apps.com',
        imageUrl: '',
        publishedAt: targetRecord.postedAt,
      };
    }

    let script: any;
    if (videoPathToPublish) {
      console.log(`🎬 Found existing rendered video on disk: ${videoPathToPublish}`);
      console.log('   Skipping Remotion video rendering (instant dispatch)!\n');
      script = await generateVideoScript(story);
    } else {
      console.log(`⚠️ Video file not found at out/${targetRecord.storyId}.mp4. Re-rendering video...`);
      script = await generateVideoScript(story);
      const buildDir = path.resolve(process.cwd(), 'build');
      const outAudioPath = path.resolve(buildDir, `${story.id}_audio.mp3`);
      const ttsResult = await synthesizeVoiceover(script.fullSpokenText, outAudioPath);
      const fps = 30;
      const durationInFrames = Math.ceil(ttsResult.durationSeconds * fps);
      const audioBuffer = await fsp.readFile(ttsResult.audioPath);
      const audioDataUri = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

      const inputProps: VideoCompositionProps = {
        story,
        script,
        audioSrc: audioDataUri,
        words: ttsResult.words,
        durationInFrames,
      };

      const outDir = path.resolve(process.cwd(), 'out');
      await fsp.mkdir(outDir, { recursive: true });
      videoPathToPublish = path.resolve(outDir, `${story.id}.mp4`);
      await renderVideoToDisk({
        inputProps,
        outputPath: videoPathToPublish,
      });
    }

    console.log('🚀 Distributing missing platform(s)...');
    const publishResults = await publishToAllChannels(
      {
        videoPath: videoPathToPublish,
        title: targetRecord.videoTitle || script.videoTitle,
        description: script.videoDescription,
        tags: script.hashtags,
        topic: story.headline,
        sourceName: story.sourceName,
      },
      undefined,
      {
        skipYouTube: !needYouTube,
        skipInstagram: !needInstagram,
      }
    );

    const finalYt = publishResults.youtube?.publishedUrl || targetRecord.youtubeUrl;
    const finalIg =
      publishResults.instagram?.publishedUrl ||
      (publishResults.instagram?.id ? `https://instagram.com/reel/${publishResults.instagram.id}` : undefined) ||
      targetRecord.instagramUrl;

    await recordPostedStory({
      ...targetRecord,
      videoPath: videoPathToPublish,
      youtubeUrl: finalYt,
      instagramUrl: finalIg,
      postedAt: new Date().toISOString(),
    });

    console.log('\n====================================================');
    console.log('🎉 Retry Social Distribution Completed!');
    console.log(`   Story:     "${targetRecord.headline}"`);
    console.log(`   Video:     ${videoPathToPublish}`);
    if (publishResults.youtube?.publishedUrl) {
      console.log(`   YouTube:   PUBLISHED -> ${publishResults.youtube.publishedUrl}`);
    } else if (publishResults.youtube?.skipped) {
      console.log(`   YouTube:   SKIPPED (${publishResults.youtube.error || 'Already published or paused'})`);
    } else if (publishResults.youtube?.error) {
      console.log(`   YouTube:   FAILED (${publishResults.youtube.error})`);
    }

    if (publishResults.instagram?.publishedUrl) {
      console.log(`   Instagram: PUBLISHED -> ${publishResults.instagram.publishedUrl}`);
    } else if (publishResults.instagram?.id) {
      console.log(`   Instagram: PUBLISHED -> Reel ID ${publishResults.instagram.id}`);
    } else if (publishResults.instagram?.skipped) {
      console.log(`   Instagram: SKIPPED (${publishResults.instagram.error || 'Already published or paused'})`);
    } else if (publishResults.instagram?.error) {
      console.log(`   Instagram: FAILED (${publishResults.instagram.error})`);
    }
    console.log('====================================================\n');
    return;
  }

  // --- STANDARD NEW STORY PIPELINE ---
  // Step 1: Select top unposted story from AIShort feed
  console.log('📡 [1/5] Ingesting AIShort feed and selecting story...');
  const story = await selectStoryForVideo({
    forceLatest: isForce || Boolean(targetSearch || targetStoryId),
    storyId: targetStoryId,
    searchQuery: targetSearch,
  });
  console.log(`   Selected: "${story.headline}" [${story.category}]`);
  console.log(`   Source:   ${story.sourceName} (${story.sourceUrl})\n`);

  // Step 2: Generate script via Gemini
  console.log('🤖 [2/5] Synthesizing viral short-form script via Gemini...');
  const script = await generateVideoScript(story);
  console.log(`   Title:   "${script.videoTitle}"`);
  console.log(`   Hook:    "${script.hook}"`);
  console.log(`   Words:   ${script.fullSpokenText.split(/\s+/).length} words\n`);

  // Step 3: Synthesize voiceover and word timestamps via Edge-TTS
  const buildDir = path.resolve(process.cwd(), 'build');
  const outAudioPath = path.resolve(buildDir, `${story.id}_audio.mp3`);

  console.log('🎙️ [3/5] Generating neural voiceover & word timestamps (Edge-TTS)...');
  const ttsResult = await synthesizeVoiceover(script.fullSpokenText, outAudioPath);
  console.log(`   Duration: ${ttsResult.durationSeconds}s`);
  console.log(`   Words:    ${ttsResult.words.length} timestamped tokens captured\n`);

  const fps = 30;
  const durationInFrames = Math.ceil(ttsResult.durationSeconds * fps);

  // In Remotion, static file URLs or local audio file paths can be converted to data URL or relative path
  // Read audio as base64 data URI so Remotion bundler can play it seamlessly in headless Chromium!
  const audioBuffer = await fsp.readFile(ttsResult.audioPath);
  const audioDataUri = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

  const inputProps: VideoCompositionProps = {
    story,
    script,
    audioSrc: audioDataUri,
    words: ttsResult.words,
    durationInFrames,
  };

  if (isDryRun) {
    console.log('✨ [Dry Run Complete] Generated script and audio successfully.');
    console.log(`   Audio file: ${ttsResult.audioPath}`);
    console.log(`   Subtitles:  ${ttsResult.subtitlesPath}`);
    return;
  }

  // Step 4: Render MP4 Video via Remotion
  const outDir = path.resolve(process.cwd(), 'out');
  const outVideoPath = path.resolve(outDir, `${story.id}.mp4`);

  console.log('🎥 [4/5] Rendering 1080x1920 9:16 vertical video via Remotion...');
  let lastProgress = 0;
  await renderVideoToDisk({
    inputProps,
    outputPath: outVideoPath,
    onProgress: (p) => {
      if (p >= lastProgress + 20 || p === 100) {
        console.log(`   Rendering progress: ${p}%`);
        lastProgress = p;
      }
    },
  });

  // Step 5: Update Deduplication Ledger (initial record)
  console.log('\n📝 [5/6] Recording story in posted archive ledger...');
  await recordPostedStory({
    storyId: story.id,
    headline: story.headline,
    videoTitle: script.videoTitle,
    videoPath: outVideoPath,
    audioPath: ttsResult.audioPath,
    durationSeconds: ttsResult.durationSeconds,
    postedAt: new Date().toISOString(),
  });

  // Step 6: Autonomous Social Distribution (YouTube & Instagram)
  if (isNoPublish) {
    console.log('\n⏩ [6/6] Skipping social distribution (--no-publish passed).');
    console.log('\n====================================================');
    console.log('🎉 Video Render Completed Successfully!');
    console.log(`   MP4 Video:   ${outVideoPath}`);
    console.log(`   Title:       ${script.videoTitle}`);
    console.log(`   Description: ${script.videoDescription}`);
    console.log(`   Hashtags:    ${script.hashtags.join(' ')}`);
    console.log('====================================================\n');
  } else {
    console.log('\n🚀 [6/6] Distributing to social platforms...');
    const publishResults = await publishToAllChannels({
      videoPath: outVideoPath,
      title: script.videoTitle,
      description: script.videoDescription,
      tags: script.hashtags,
      topic: story.headline,
      sourceName: story.sourceName,
    });

    const finalYt = publishResults.youtube?.publishedUrl;
    const finalIg =
      publishResults.instagram?.publishedUrl ||
      (publishResults.instagram?.id ? `https://instagram.com/reel/${publishResults.instagram.id}` : undefined);

    await recordPostedStory({
      storyId: story.id,
      headline: story.headline,
      videoTitle: script.videoTitle,
      videoPath: outVideoPath,
      audioPath: ttsResult.audioPath,
      durationSeconds: ttsResult.durationSeconds,
      postedAt: new Date().toISOString(),
      youtubeUrl: finalYt,
      instagramUrl: finalIg,
    });

    console.log('\n====================================================');
    console.log('🎉 Video Pipeline Completed Successfully!');
    console.log(`   MP4 Video:   ${outVideoPath}`);
    console.log(`   Title:       ${script.videoTitle}`);
    console.log(`   Description: ${script.videoDescription}`);
    console.log(`   Hashtags:    ${script.hashtags.join(' ')}`);
    if (publishResults.youtube?.publishedUrl) {
      console.log(`   YouTube:     ${publishResults.youtube.publishedUrl}`);
    } else if (publishResults.youtube?.skipped) {
      console.log(`   YouTube:     SKIPPED (${publishResults.youtube.error || 'Publishing paused'})`);
    } else if (publishResults.youtube?.error) {
      console.log(`   YouTube:     FAILED (${publishResults.youtube.error})`);
    }

    if (publishResults.instagram?.publishedUrl) {
      console.log(`   Instagram:   ${publishResults.instagram.publishedUrl}`);
    } else if (publishResults.instagram?.id) {
      console.log(`   Instagram:   Reel ID ${publishResults.instagram.id}`);
    } else if (publishResults.instagram?.skipped) {
      console.log(`   Instagram:   SKIPPED (${publishResults.instagram.error || 'Publishing paused'})`);
    } else if (publishResults.instagram?.error) {
      console.log(`   Instagram:   FAILED (${publishResults.instagram.error})`);
    }
    console.log('====================================================\n');
  }
}

// Execute CLI
runPipeline().catch((err) => {
  console.error('\n❌ Video Pipeline Error:', err.message);
  process.exit(1);
});

