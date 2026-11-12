import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Reveal during the last 150 frames (~5 seconds)
  const revealFrame = Math.max(0, durationInFrames - 150);
  const relativeFrame = Math.max(0, frame - revealFrame);

  const entrance = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 15, mass: 0.9 },
  });

  const opacity = interpolate(relativeFrame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  if (frame < revealFrame) {
    // Show static subtle brand pill before final CTA
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 60,
          right: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          borderRadius: 30,
          backgroundColor: 'rgba(15, 18, 28, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 70,
        }}
      >
        <span
          style={{
            color: '#94a3b8',
            fontSize: 22,
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Daily AI News in 60 Words • <span style={{ color: '#38bdf8' }}>aishort.nextai-apps.com</span>
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 70,
        left: 60,
        right: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 24px',
        borderRadius: 30,
        backgroundColor: 'rgba(15, 18, 28, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        transform: `scale(${entrance})`,
        opacity,
        zIndex: 95,
      }}
    >
      <span
        style={{
          color: '#e2e8f0',
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.04em',
        }}
      >
        🔗 Link in Pinned Comment & Bio • <span style={{ color: '#38bdf8' }}>aishort.nextai-apps.com</span>
      </span>
    </div>
  );
};

