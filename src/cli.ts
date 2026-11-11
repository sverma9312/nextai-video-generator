import path from 'node:path';
import fsp from 'node:fs/promises';
import { selectStoryForVideo } from './feed/selector.js';
import { generateVideoScript } from './script/generator.js';
import { synthesizeVoiceover } from './audio/tts.js';
import { renderVideoToDisk } from './render/renderer.js';
import { recordPostedStory } from './feed/archive.js';
import type { VideoCompositionProps } from './video/types.js';

export async function runPipeline(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isForce = args.includes('--force');

  console.log('====================================================');
  console.log('🚀 NextAI Video Generator — Autonomous Daily Pipeline');
  console.log(`   Mode: ${isDryRun ? 'DRY-RUN (No MP4 Render)' : 'FULL RENDER'}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('====================================================\n');

  // Step 1: Select top unposted story from AIShort feed
  console.log('📡 [1/5] Ingesting AIShort feed and selecting story...');
  const story = await selectStoryForVideo({ forceLatest: isForce });
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

  // Step 5: Update Deduplication Ledger
  console.log('\n📝 [5/5] Recording story in posted archive ledger...');
  await recordPostedStory({
    storyId: story.id,
    headline: story.headline,
    videoTitle: script.videoTitle,
    videoPath: outVideoPath,
    audioPath: ttsResult.audioPath,
    durationSeconds: ttsResult.durationSeconds,
    postedAt: new Date().toISOString(),
  });

  console.log('\n====================================================');
  console.log('🎉 Video Pipeline Completed Successfully!');
  console.log(`   MP4 Video:   ${outVideoPath}`);
  console.log(`   Title:       ${script.videoTitle}`);
  console.log(`   Description: ${script.videoDescription}`);
  console.log(`   Hashtags:    ${script.hashtags.join(' ')}`);
  console.log('====================================================\n');
}

// Self-executing CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runPipeline().catch((err) => {
    console.error('\n❌ Video Pipeline Error:', err.message);
    process.exit(1);
  });
}
