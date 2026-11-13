import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uploadToYouTubeShorts } from './youtube.js';
import { uploadToInstagramReels } from './instagram.js';
import type { SocialPublishRequest } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const videoPath = path.resolve(__dirname, '../../out/c_97f0acca4dc235e3.mp4');

  const request: SocialPublishRequest = {
    videoPath,
    title: 'Claude AI Just Joined Your Office #Shorts',
    description: 'Anthropic launched Claude Meetings and productivity tools! Here is everything you need to know in 30 seconds.',
    tags: ['#AIShort', '#ArtificialIntelligence', '#ClaudeAI', '#TechNews', '#Productivity'],
    topic: 'Anthropic launches Claude Meetings and new productivity tools',
    sourceName: 'Anthropic',
  };

  console.log(`🎬 Target Video File: ${videoPath}`);

  // 1. YouTube (Private mode for safety)
  console.log('\n========================================');
  console.log('1️⃣ TESTING YOUTUBE SHORTS UPLOAD (Private)');
  console.log('========================================');
  process.env.ENABLE_YOUTUBE_PUBLISH = 'true';
  process.env.YOUTUBE_PRIVACY_STATUS = process.env.YOUTUBE_PRIVACY_STATUS || 'private';
  const ytResult = await uploadToYouTubeShorts(request);
  console.log('YouTube Publish Result:', ytResult);

  // 2. Instagram Reels
  console.log('\n========================================');
  console.log('2️⃣ TESTING INSTAGRAM REELS DIRECT UPLOAD');
  console.log('========================================');
  process.env.ENABLE_INSTAGRAM_PUBLISH = 'true';
  const igResult = await uploadToInstagramReels(request);
  console.log('Instagram Publish Result:', igResult);

  console.log('\n========================================');
  console.log('🏁 SUMMARY');
  console.log('========================================');
  console.log(`YouTube:   ${ytResult.success ? `✅ SUCCESS (${ytResult.publishedUrl})` : `❌ FAILED: ${ytResult.error}`}`);
  console.log(`Instagram: ${igResult.success ? `✅ SUCCESS (${igResult.publishedUrl || igResult.id})` : `❌ FAILED: ${igResult.error}`}`);
}

run().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
});

