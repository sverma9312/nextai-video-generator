import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface HeaderPillProps {
  category: string;
}

export const HeaderPill: React.FC<HeaderPillProps> = ({ category }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress bar calculation
  const progressPercent = Math.min(100, (frame / durationInFrames) * 100);

  // Animated AI Host pulsing orb
  const pulseScale = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.9, 1.15]);
  const ringScale = interpolate(Math.sin(frame * 0.15 + 1), [-1, 1], [1.1, 1.45]);
  const ringOpacity = interpolate(Math.sin(frame * 0.15 + 1), [-1, 1], [0.2, 0.7]);

  return (
    <>
      {/* Top thin progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)',
          }}
        />
      </div>

      {/* Main Top Header Floating Pill */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 60,
          right: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderRadius: 40,
          backgroundColor: 'rgba(15, 18, 28, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 90,
        }}
      >
        {/* Left: AI Mascot + Channel Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Animated AI Mascot Orb */}
          <div
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer animated glow ring */}
            <div
              style={{
                position: 'absolute',
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '2px solid #38bdf8',
                transform: `scale(${ringScale})`,
                opacity: ringOpacity,
              }}
            />
            {/* Inner pulsing cyber core */}
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #38bdf8 0%, #4f46e5 100%)',
                boxShadow: '0 0 14px rgba(56, 189, 248, 0.9)',
                transform: `scale(${pulseScale})`,
              }}
            />
          </div>

          <span
            style={{
              color: '#ffffff',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '1px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            AISHORT <span style={{ color: '#38bdf8' }}>DAILY</span>
          </span>
        </div>

        {/* Right: Category Badge */}
        <div
          style={{
            padding: '8px 18px',
            borderRadius: 20,
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            color: '#38bdf8',
            fontSize: 20,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {category || 'AI NEWS'}
        </div>
      </div>
    </>
  );
};

