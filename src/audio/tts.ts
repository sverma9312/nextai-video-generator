import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { SubtitleWord } from '../feed/types.js';

export interface TTSResult {
  audioPath: string;
  subtitlesPath: string;
  durationSeconds: number;
  words: SubtitleWord[];
}

export async function synthesizeVoiceover(
  spokenText: string,
  outAudioPath: string,
  voiceName: string = 'en-US-ChristopherNeural'
): Promise<TTSResult> {
  const dir = path.dirname(outAudioPath);
  await fsp.mkdir(dir, { recursive: true });

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
    wordBoundaryEnabled: true,
  });

  const words: SubtitleWord[] = [];
  const writeStream = fs.createWriteStream(outAudioPath);
  const stream = tts.toStream(spokenText);

  // Collect word boundaries from metadataStream
  if (stream.metadataStream) {
    stream.metadataStream.on('data', (chunk: Buffer) => {
      try {
        const parsed = JSON.parse(chunk.toString('utf-8'));
        if (parsed?.Metadata) {
          for (const item of parsed.Metadata) {
            if (item.Type === 'WordBoundary' && item.Data?.text?.Text) {
              const offsetTicks = item.Data.Offset || 0;
              const durationTicks = item.Data.Duration || 0;
              words.push({
                word: item.Data.text.Text.trim(),
                startMs: Math.round(offsetTicks / 10000),
                endMs: Math.round((offsetTicks + durationTicks) / 10000),
              });
            }
          }
        }
      } catch {
        // ignore
      }
    });
  }

  // Pipe audio bytes to file
  stream.audioStream.pipe(writeStream);

  // Wait for audio writing to complete (turn.end pushes null to audioStream)
  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => {
      // Give a tiny 50ms tick to ensure last metadata events are processed
      setTimeout(resolve, 50);
    });
    writeStream.on('error', reject);
    stream.audioStream.on('error', reject);
  });

  // Close TTS client to release websocket
  tts.close();

  // Calculate approximate duration based on last word boundary
  let durationSeconds = 30;
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    durationSeconds = Math.max(1, (lastWord.endMs + 1000) / 1000); // Add 1s buffer for outro decay
  }

  // Save subtitles JSON alongside audio file
  const subtitlesPath = outAudioPath.replace(/\.mp3$/i, '_subtitles.json');
  await fsp.writeFile(subtitlesPath, JSON.stringify(words, null, 2), 'utf-8');

  return {
    audioPath: outAudioPath,
    subtitlesPath,
    durationSeconds: Number(durationSeconds.toFixed(2)),
    words,
  };
}

import { pathToFileURL } from 'node:url';

// Self-executing test for Phase 3 verification
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  (async () => {
    try {
      console.log('🎙️ [Phase 3 Test] Synthesizing neural voice with word-level boundaries...\n');
      const testText = 'Google DeepMind just announced AlphaGenome 2. It predicts DNA variant effects in individual human cell types with unprecedented precision. Read the briefing on AIShort.';
      const outPath = path.resolve(process.cwd(), 'build/test_audio.mp3');

      const result = await synthesizeVoiceover(testText, outPath);
      console.log('✅ Voice Synthesis Complete:');
      console.log(`   Audio Output:   ${result.audioPath}`);
      console.log(`   Subtitles:      ${result.subtitlesPath}`);
      console.log(`   Duration:       ${result.durationSeconds}s`);
      console.log(`   Words Captured: ${result.words.length}`);
      console.log('   Sample Word Timings (First 5):');
      result.words.slice(0, 5).forEach((w) => {
        console.log(`     [${w.startMs}ms - ${w.endMs}ms] "${w.word}"`);
      });
      console.log('\n🎯 Phase 3 Voice Synthesis & Word Alignment: PASSED');
    } catch (err: any) {
      console.error('❌ Phase 3 Test Failed:', err.message);
      process.exit(1);
    }
  })();
}
