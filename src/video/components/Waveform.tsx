import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const barCount = 28;

  return (
    <div
      style={{
        position: 'absolute',
        top: 1040,
        left: 0,
        width: 1080,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 60,
        zIndex: 60,
      }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        // Pseudo audio reactivity with harmonic wave synthesis
        const wave =
          Math.sin(frame * 0.18 + i * 0.45) * 0.5 +
          Math.cos(frame * 0.28 - i * 0.3) * 0.3 +
          Math.sin(frame * 0.08 + i * 0.9) * 0.2;

        const height = interpolate(wave, [-1, 1], [10, 52]);
        const opacity = interpolate(wave, [-1, 1], [0.4, 0.95]);

        return (
          <div
            key={i}
            style={{
              width: 8,
              height,
              borderRadius: 4,
              background: 'linear-gradient(180deg, #38bdf8 0%, #818cf8 100%)',
              opacity,
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
              transition: 'height 0.05s ease',
            }}
          />
        );
      })}
    </div>
  );
};

