import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { SubtitleWord } from '../../feed/types';
import { groupWordsIntoChunks } from '../../audio/subtitles';

interface KineticCaptionsProps {
  words: SubtitleWord[];
}

export const KineticCaptions: React.FC<KineticCaptionsProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentMs = (frame / fps) * 1000;
  const chunks = React.useMemo(() => groupWordsIntoChunks(words, 3), [words]);

  // Find the active phrase
  const activeChunk = chunks.find(
    (c) => currentMs >= c.startMs - 50 && currentMs <= c.endMs + 250
  );

  if (!activeChunk) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 1140,
        left: 60,
        width: 960,
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: '24px 36px',
          borderRadius: 32,
          backgroundColor: 'rgba(10, 12, 20, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        {activeChunk.words.map((w, index) => {
          const isActive = currentMs >= w.startMs - 30 && currentMs <= w.endMs + 80;

          return (
            <span
              key={`${w.word}-${index}`}
              style={{
                fontSize: isActive ? 56 : 50,
                fontWeight: 900,
                textTransform: 'uppercase',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '1px',
                color: isActive ? '#38bdf8' : '#ffffff',
                transform: isActive ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 0.08s ease, color 0.08s ease',
                textShadow: isActive
                  ? '0 0 30px rgba(56, 189, 248, 0.9), 0 0 10px rgba(56, 189, 248, 1)'
                  : '0 4px 14px rgba(0, 0, 0, 0.95)',
                display: 'inline-block',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
