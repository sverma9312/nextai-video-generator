import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const orb1Y = interpolate(Math.sin(frame * 0.02), [-1, 1], [300, 500]);
  const orb2Y = interpolate(Math.cos(frame * 0.015), [-1, 1], [1200, 1400]);

  return (
    <div
      style={{
        position: 'absolute',
        width: 1080,
        height: 1920,
        backgroundColor: '#07080d',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient radial glow 1 */}
      <div
        style={{
          position: 'absolute',
          top: orb1Y,
          left: 200,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Background ambient radial glow 2 */}
      <div
        style={{
          position: 'absolute',
          top: orb2Y,
          right: 150,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* Tech grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.6,
        }}
      />
    </div>
  );
};
