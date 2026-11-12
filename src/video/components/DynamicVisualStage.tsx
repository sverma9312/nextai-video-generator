import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { FeedCard, VideoScript } from '../../feed/types';

interface DynamicVisualStageProps {
  story: FeedCard;
  script: VideoScript;
}

export const DynamicVisualStage: React.FC<DynamicVisualStageProps> = ({ story, script }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene transition thresholds (in frames)
  // Scene 1 (Hook): 0 -> 28% of video
  // Scene 2 (Point 1 Breakdown): 28% -> 62% of video
  // Scene 3 (Point 2 Impact): 62% -> (duration - 130 frames)
  // Scene 4 (Outro Hand-off): last 130 frames
  const scene1End = Math.floor(durationInFrames * 0.28);
  const scene2End = Math.floor(durationInFrames * 0.62);
  const outroStart = durationInFrames - 130;

  // Active scene determination
  let currentScene: 1 | 2 | 3 | 4 = 1;
  if (frame >= outroStart) {
    currentScene = 4;
  } else if (frame >= scene2End) {
    currentScene = 3;
  } else if (frame >= scene1End) {
    currentScene = 2;
  }

  // -------------------------------------------------------------
  // ANIMATIONS FOR SCENE 1 (HERO PHOTO + CYBER HUD)
  // -------------------------------------------------------------
  const s1Entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  // Smooth continuous Ken Burns pan & zoom
  const s1Scale = interpolate(frame, [0, scene1End], [1.0, 1.12], {
    extrapolateRight: 'clamp',
  });
  const s1PanX = interpolate(frame, [0, scene1End], [0, -20], {
    extrapolateRight: 'clamp',
  });

  // Scene 1 exit animation
  const s1ExitProgress = interpolate(frame, [scene1End - 15, scene1End], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -------------------------------------------------------------
  // ANIMATIONS FOR SCENE 2 (CORE POINT 1 FEATURE BREAKDOWN)
  // -------------------------------------------------------------
  const s2RelativeFrame = Math.max(0, frame - scene1End);
  const s2Entrance = spring({
    frame: s2RelativeFrame,
    fps,
    config: { damping: 13, mass: 0.85 },
  });
  const s2ExitProgress = interpolate(frame, [scene2End - 15, scene2End], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // -------------------------------------------------------------
  // ANIMATIONS FOR SCENE 3 (CORE POINT 2 IMPACT & ANALYSIS)
  // -------------------------------------------------------------
  const s3RelativeFrame = Math.max(0, frame - scene2End);
  const s3Entrance = spring({
    frame: s3RelativeFrame,
    fps,
    config: { damping: 13, mass: 0.85 },
  });
  const s3ExitProgress = interpolate(frame, [outroStart - 15, outroStart], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Active point text
  const point1Text = script.corePoints[0] || story.summary || 'Key breakthrough announced in latest briefing.';
  const point2Text = script.corePoints[1] || 'Major implications for production AI workflows and enterprise scale.';

  return (
    <div
      style={{
        position: 'absolute',
        top: 200,
        left: 60,
        width: 960,
        height: 740,
        zIndex: 50,
      }}
    >
      {/* ========================================================= */}
      {/* CHAPTER STEP INDICATOR (Top of visual stage)              */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 18,
          width: '100%',
          padding: '0 4px',
        }}
      >
        {[
          { label: '01 OVERVIEW', active: currentScene === 1, done: currentScene > 1 },
          { label: '02 BREAKDOWN', active: currentScene === 2, done: currentScene > 2 },
          { label: '03 IMPACT', active: currentScene === 3, done: currentScene > 3 },
        ].map((step, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 8,
              backgroundColor: step.done
                ? 'rgba(56, 189, 248, 0.35)'
                : step.active
                ? 'rgba(56, 189, 248, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
              border: step.active
                ? '1px solid #38bdf8'
                : '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              gap: 8,
            }}
          >
            {step.active && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 10px #38bdf8',
                }}
              />
            )}
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: step.active ? '#38bdf8' : step.done ? '#94a3b8' : '#475569',
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* SCENE 1: HERO PHOTO + CYBER SCANLINE & LIGHT SHEEN        */}
      {/* ========================================================= */}
      {currentScene === 1 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            transform: `scale(${s1Entrance})`,
            opacity: s1ExitProgress,
            transformOrigin: 'center center',
          }}
        >
          {/* Image Container */}
          <div
            style={{
              position: 'relative',
              width: 960,
              height: 520,
              borderRadius: 32,
              overflow: 'hidden',
              backgroundColor: '#111420',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.2)',
            }}
          >
            {/* Main Photo with Ken Burns pan/zoom */}
            <Img
              src={story.imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${s1Scale}) translateX(${s1PanX}px)`,
              }}
            />

            {/* Gradient shadow for text contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
              }}
            />

            {/* HUD Corner Tech Brackets */}
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: 18,
                width: 24,
                height: 24,
                borderTop: '2.5px solid #38bdf8',
                borderLeft: '2.5px solid #38bdf8',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                width: 24,
                height: 24,
                borderTop: '2.5px solid #38bdf8',
                borderRight: '2.5px solid #38bdf8',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                left: 18,
                width: 24,
                height: 24,
                borderBottom: '2.5px solid #38bdf8',
                borderLeft: '2.5px solid #38bdf8',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                right: 18,
                width: 24,
                height: 24,
                borderBottom: '2.5px solid #38bdf8',
                borderRight: '2.5px solid #38bdf8',
              }}
            />

            {/* Top Right Floating Badge: LIVE ALERT */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                right: 28,
                padding: '6px 16px',
                borderRadius: 9999,
                backgroundColor: 'rgba(239, 68, 68, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: '0.12em',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                }}
              />
              BREAKING
            </div>

            {/* Bottom Left Attribution Tag */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 28,
                padding: '8px 20px',
                borderRadius: 16,
                backgroundColor: 'rgba(10, 13, 22, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Source: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{story.sourceName}</span>
            </div>
          </div>

          {/* Headline Below Image */}
          <div
            style={{
              color: '#ffffff',
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.25,
              textAlign: 'center',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
              padding: '0 16px',
            }}
          >
            {story.headline}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCENE 2: CORE POINT 1 - FEATURE BREAKDOWN CARD           */}
      {/* ========================================================= */}
      {currentScene === 2 && (
        <div
          style={{
            position: 'relative',
            width: 960,
            height: 680,
            borderRadius: 36,
            backgroundColor: '#0c0f1a',
            border: '2px solid rgba(56, 189, 248, 0.5)',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(56, 189, 248, 0.25)',
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            transform: `scale(${s2Entrance})`,
            opacity: s2ExitProgress,
            overflow: 'hidden',
          }}
        >
          {/* Subtle animated background gradient */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Top Label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 20px',
                borderRadius: 9999,
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 8px #38bdf8',
                }}
              />
              CORE CAPABILITY // 01
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.12em',
              }}
            >
              TECH DEEP-DIVE
            </div>
          </div>

          {/* Central Point Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1.3,
                color: '#ffffff',
                textShadow: '0 2px 15px rgba(0,0,0,0.8)',
              }}
            >
              {point1Text}
            </div>
          </div>

          {/* Feature Highlight Metric Pills */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                flex: 1,
                padding: '18px 24px',
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ⚡
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em' }}>
                  PERFORMANCE
                </div>
                <div style={{ fontSize: 22, color: '#ffffff', fontWeight: 800 }}>
                  High-Precision
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '18px 24px',
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                🔬
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em' }}>
                  ARCHITECTURE
                </div>
                <div style={{ fontSize: 22, color: '#ffffff', fontWeight: 800 }}>
                  Next-Gen Model
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCENE 3: CORE POINT 2 - IMPACT & ADVANTAGE CARD          */}
      {/* ========================================================= */}
      {currentScene === 3 && (
        <div
          style={{
            position: 'relative',
            width: 960,
            height: 680,
            borderRadius: 36,
            backgroundColor: '#0e0d1a',
            border: '2px solid rgba(139, 92, 246, 0.5)',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(139, 92, 246, 0.25)',
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            transform: `scale(${s3Entrance})`,
            opacity: s3ExitProgress,
            overflow: 'hidden',
          }}
        >
          {/* Subtle animated violet glow */}
          <div
            style={{
              position: 'absolute',
              bottom: -100,
              left: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Top Label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 20px',
                borderRadius: 9999,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#a78bfa',
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#a78bfa',
                  boxShadow: '0 0 8px #a78bfa',
                }}
              />
              INDUSTRY IMPACT // 02
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#10b981',
                letterSpacing: '0.12em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
              SIGNIFICANT SHIFT
            </div>
          </div>

          {/* Point 2 Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1.3,
                color: '#ffffff',
                textShadow: '0 2px 15px rgba(0,0,0,0.8)',
              }}
            >
              {point2Text}
            </div>
          </div>

          {/* 3 Key Takeaway Badges */}
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              { icon: '🚀', text: 'Production Scale', color: '#38bdf8' },
              { icon: '🎯', text: 'Real-World Impact', color: '#10b981' },
              { icon: '📊', text: 'Benchmark Lead', color: '#fbbf24' },
            ].map((badge, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>{badge.icon}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCENE 4: OUTRO HANDOFF (smooth placeholder for OutroCard)  */}
      {/* ========================================================= */}
      {currentScene === 4 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        />
      )}
    </div>
  );
};

