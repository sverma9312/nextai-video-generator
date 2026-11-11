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
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: '28px 32px',
        borderRadius: 36,
        backgroundColor: 'rgba(12, 14, 24, 0.9)',
        backdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(56, 189, 248, 0.5)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.3)',
        transform: `scale(${entrance})`,
        opacity,
        zIndex: 95,
      }}
    >
      <div
        style={{
          color: '#ffffff',
          fontSize: 28,
          fontWeight: 800,
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        Read the 60-Word Briefing on <span style={{ color: '#38bdf8' }}>AIShort</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 28px',
          borderRadius: 24,
          background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
          color: '#07080d',
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 4px 20px rgba(56, 189, 248, 0.5)',
        }}
      >
        aishort.nextai-apps.com • Link in Bio →
      </div>
    </div>
  );
};
