import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { VideoCompositionProps } from '../video/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RenderOptions {
  inputProps: VideoCompositionProps;
  outputPath: string;
  onProgress?: (progress: number) => void;
}

export async function renderVideoToDisk(options: RenderOptions): Promise<string> {
  const { inputProps, outputPath, onProgress } = options;

  await fsp.mkdir(path.dirname(outputPath), { recursive: true });

  const entryPoint = path.resolve(__dirname, '../video/Root.tsx');

  console.log('📦 Bundling Remotion React composition...');
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  console.log('🎬 Selecting composition "NextAIVideo"...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'NextAIVideo',
    inputProps,
  });

  console.log(`🎥 Rendering MP4 (${composition.width}x${composition.height} @ ${composition.fps}fps, ${inputProps.durationInFrames} frames)...`);

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: inputProps.durationInFrames,
    },
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (onProgress) onProgress(pct);
    },
  });

  console.log(`✅ Video rendered successfully: ${outputPath}`);
  return outputPath;
}
