import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { FeedCard } from '../../feed/types';

interface HeroVisualProps {
  story: FeedCard;
}

export const HeroVisual: React.FC<HeroVisualProps> = ({ story }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Smooth entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  // Continuous Ken Burns slow zoom (1.00 -> 1.14)
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.14], {
    extrapolateRight: 'clamp',
  });

  // Subtle pan
  const panX = interpolate(frame, [0, durationInFrames], [0, -25], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 210,
        left: 60,
        width: 960,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        transform: `scale(${entrance})`,
        transformOrigin: 'top center',
        zIndex: 50,
      }}
    >
      {/* Image Container with Ken Burns Effect */}
      <div
        style={{
          position: 'relative',
          width: 960,
          height: 600,
          borderRadius: 36,
          overflow: 'hidden',
          backgroundColor: '#131622',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15)',
        }}
      >
        <Img
          src={story.imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translateX(${panX}px)`,
          }}
        />

        {/* Gradient shadow overlay for contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {/* Source Attribution Tag (Bottom Left of Image) */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 28,
            padding: '8px 20px',
            borderRadius: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e2e8f0',
            fontSize: 20,
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Source: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{story.sourceName}</span>
        </div>
      </div>

      {/* Headline Text Below Image */}
      <div
        style={{
          color: '#ffffff',
          fontSize: 38,
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: '-0.5px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
          padding: '0 20px',
        }}
      >
        {story.headline}
      </div>
    </div>
  );
};
