import React from 'react';
import { Audio } from 'remotion';
import type { VideoCompositionProps } from './types';
import { Background } from './components/Background';
import { HeaderPill } from './components/HeaderPill';
import { DynamicVisualStage } from './components/DynamicVisualStage';
import { Waveform } from './components/Waveform';
import { KineticCaptions } from './components/KineticCaptions';
import { OutroCard } from './components/OutroCard';

export const MainComposition: React.FC<VideoCompositionProps> = ({
  story,
  script,
  audioSrc,
  words,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Ambient Background Layer */}
      <Background />

      {/* 2. Top Header Pill with Animated Mascot */}
      <HeaderPill category={story.category} />

      {/* 3. Multi-Scene Dynamic Visual Stage (Hook -> Breakdown -> Impact) */}
      <DynamicVisualStage story={story} script={script} />

      {/* 4. Audio Waveform Visualizer */}
      <Waveform />

      {/* 5. Kinetic Hormozi Subtitles */}
      <KineticCaptions words={words} />

      {/* 6. Outro Brand / CTA Card */}
      <OutroCard />

      {/* 7. Neural Voiceover Audio Track */}
      {audioSrc ? <Audio src={audioSrc} /> : null}
    </div>
  );
};
