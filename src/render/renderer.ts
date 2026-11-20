import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { VideoCompositionProps } from '../video/types.js';
import type { NewsPosterProps } from '../video/components/NewsPoster.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RenderOptions {
  inputProps: VideoCompositionProps;
  outputPath: string;
  coverOutputPath?: string;
  onProgress?: (progress: number) => void;
}

export interface RenderPosterOptions {
  inputProps: NewsPosterProps;
  outputPath: string;
  bundleLocation?: string;
}

export async function renderPosterToDisk(options: RenderPosterOptions): Promise<string> {
  const { inputProps, outputPath } = options;
  await fsp.mkdir(path.dirname(outputPath), { recursive: true });

  const entryPoint = path.resolve(__dirname, '../video/Root.tsx');
  const bundleLocation =
    options.bundleLocation ||
    (await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    }));

  console.log('🎨 Selecting composition "NewsPoster" for editorial cover...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'NewsPoster',
    inputProps,
  });

  console.log(`🖼️ Rendering editorial news poster thumbnail (${composition.width}x${composition.height})...`);
  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: outputPath,
    imageFormat: 'jpeg',
    inputProps,
  });

  console.log(`✅ Editorial cover rendered successfully: ${outputPath}`);
  return outputPath;
}

export async function renderVideoToDisk(options: RenderOptions): Promise<{ videoPath: string; coverPath?: string }> {
  const { inputProps, outputPath, coverOutputPath, onProgress } = options;

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

  let coverPath: string | undefined;
  if (coverOutputPath) {
    try {
      const posterProps: NewsPosterProps = {
        headline: inputProps.story.headline,
        topicKicker: inputProps.script.scene2Title || `${inputProps.story.category.toUpperCase()} BRIEFING`,
        category: inputProps.story.category,
        sourceName: inputProps.story.sourceName,
        dateStr: new Date(inputProps.story.publishedAt || Date.now())
          .toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          .toUpperCase(),
        imageUrl: inputProps.story.imageUrl,
        summaryText: inputProps.story.summary,
      };

      await renderPosterToDisk({
        inputProps: posterProps,
        outputPath: coverOutputPath,
        bundleLocation,
      });
      coverPath = coverOutputPath;
    } catch (coverErr: any) {
      console.warn(`⚠️ [Renderer] Cover thumbnail generation failed: ${coverErr.message}`);
    }
  }

  return { videoPath: outputPath, coverPath };
}

