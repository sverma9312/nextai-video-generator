import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { VideoCompositionProps } from '../src/video/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const musicGearStoryProps: VideoCompositionProps = {
  story: {
    id: 'music-gear-vibe-coding',
    headline: 'Music gear companies embrace open-source code and vibe coding',
    category: 'Open-Source',
    sourceName: 'SynthTech Today',
    sourceUrl: 'https://aishort.nextai-apps.com',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1080&auto=format&fit=crop',
    publishedAt: new Date().toISOString(),
    summary: 'Hardware synthesizers and drum machines now run open-source DSP code and AI vibe coding.',
  },
  script: {
    hook: 'Music gear legends are opening up hardware to open source and AI.',
    corePoints: [
      'Major synth makers now let musicians run custom DSP code and AI models directly on physical hardware.',
      'Over one hundred thousand creators can now mod sound engines instantly without touching firmware compilers.',
    ],
    cta: '',
    fullSpokenText: 'Music gear legends are opening up hardware to open source and AI. Major synth makers now let musicians run custom DSP code and AI models directly on physical hardware. Over one hundred thousand creators can now mod sound engines instantly without touching firmware compilers.',
    videoTitle: 'Music Gear Embraces Vibe Coding #Shorts',
    videoDescription: 'Open source hardware and AI revolutionize music production.',
    hashtags: ['#MusicTech', '#VibeCoding', '#AI', '#Shorts'],
    scene2Title: 'Open Source Hardware & Vibe Coding',
    scene3Title: 'Creator Freedom & Modding Era',
    scene2Ui: {
      appTitle: 'Claude AI • Synth Modder',
      agentAction: 'Compiling Real-Time DSP Audio Engine',
      featureMetric: 'MPC Open Code',
      status: 'COMPILER READY',
    },
    scene3Ui: {
      metricValue: '100%',
      metricLabel: 'Open Blueprints',
      rolloutStage: 'Active Industry Shift',
    },
    scene2Badges: [
      { icon: '🎛️', label: 'HARDWARE', value: 'MPC Open Code' },
      { icon: '🤖', label: 'AI ASSIST', value: 'Vibe Coding' },
    ],
    scene3Tags: [
      { icon: '🎼', text: 'Custom FX' },
      { icon: '🛠️', text: 'Hardware Modding' },
      { icon: '🚀', text: 'Creator Freedom' },
    ],
  },
  audioSrc: '',
  words: [
    { word: 'LEGENDARY', startMs: 0, endMs: 500 },
    { word: 'BEATMAKING', startMs: 500, endMs: 1000 },
    { word: 'TOOLS', startMs: 1000, endMs: 1500 },
  ],
  durationInFrames: 900,
};

async function main() {
  console.log('📦 Bundling Remotion composition...');
  const entryPoint = path.resolve(__dirname, '../src/video/Root.tsx');
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log('🎬 Selecting composition "NextAIVideo"...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'NextAIVideo',
    inputProps: musicGearStoryProps,
  });

  const brainDir = 'C:/Users/sverm/.gemini/antigravity/brain/4eb41a64-5907-4bf9-b259-2904c9fbe2dc';
  const scene2Output = path.resolve(brainDir, 'scene2_sample.jpg');
  const scene3Output = path.resolve(brainDir, 'scene3_sample.jpg');

  console.log(`📸 Rendering Scene 2 Sample at frame 450 -> ${scene2Output}...`);
  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: scene2Output,
    imageFormat: 'jpeg',
    frame: 450,
    inputProps: musicGearStoryProps,
  });

  console.log(`📸 Rendering Scene 3 Sample at frame 750 -> ${scene3Output}...`);
  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: scene3Output,
    imageFormat: 'jpeg',
    frame: 750,
    inputProps: musicGearStoryProps,
  });

  console.log('✅ Both scene sample images rendered successfully!');
}

main().catch((err) => {
  console.error('❌ Render failed:', err);
  process.exit(1);
});
