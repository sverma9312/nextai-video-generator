import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { FeedCard, VideoScript } from '../../feed/types';

interface DynamicVisualStageProps {
  story: FeedCard;
  script: VideoScript;
}

function resolveScene2Badges(story: FeedCard, script?: VideoScript): { icon: string; label: string; value: string; color: string }[] {
  if (script?.scene2Badges && script.scene2Badges.length >= 2) {
    return [
      {
        icon: script.scene2Badges[0].icon || '⚡',
        label: (script.scene2Badges[0].label || 'FEATURE').toUpperCase(),
        value: script.scene2Badges[0].value,
        color: '#38bdf8',
      },
      {
        icon: script.scene2Badges[1].icon || '🛠️',
        label: (script.scene2Badges[1].label || 'CAPABILITY').toUpperCase(),
        value: script.scene2Badges[1].value,
        color: '#818cf8',
      },
    ];
  }

  const cat = (story.category || '').toLowerCase();
  const text = (story.headline + ' ' + story.summary).toLowerCase();

  if (cat.includes('product') || text.includes('meeting') || text.includes('office') || text.includes('tool') || text.includes('sheet')) {
    return [
      { icon: '⚡', label: 'CAPABILITY', value: 'Live Video Calls', color: '#38bdf8' },
      { icon: '🛠️', label: 'SUITE', value: 'Sheets & Canvas', color: '#818cf8' },
    ];
  }
  if (cat.includes('business') || text.includes('ipo') || text.includes('invest') || text.includes('nasdaq')) {
    return [
      { icon: '📈', label: 'MARKET', value: 'Wall Street', color: '#10b981' },
      { icon: '🏛️', label: 'LISTING', value: 'Public Offering', color: '#38bdf8' },
    ];
  }
  if (cat.includes('research') || text.includes('paper') || text.includes('quantum') || text.includes('science')) {
    return [
      { icon: '🔬', label: 'METHOD', value: 'Peer-Reviewed', color: '#a855f7' },
      { icon: '🧠', label: 'DOMAIN', value: 'Frontier AI', color: '#38bdf8' },
    ];
  }
  return [
    { icon: '⚡', label: 'EFFICIENCY', value: 'High-Speed', color: '#38bdf8' },
    { icon: '🌐', label: 'DEPLOYMENT', value: 'Cloud Scale', color: '#818cf8' },
  ];
}

function resolveScene3Tags(story: FeedCard, script?: VideoScript): { icon: string; text: string; color: string }[] {
  const palette = ['#38bdf8', '#10b981', '#fbbf24'];
  if (script?.scene3Tags && script.scene3Tags.length >= 3) {
    return script.scene3Tags.slice(0, 3).map((tag, idx) => ({
      icon: tag.icon || '🎯',
      text: tag.text,
      color: palette[idx % palette.length],
    }));
  }

  const cat = (story.category || '').toLowerCase();
  const text = (story.headline + ' ' + story.summary).toLowerCase();

  if (cat.includes('product') || text.includes('meeting') || text.includes('office') || text.includes('tool') || text.includes('sheet')) {
    return [
      { icon: '👥', text: 'Team Collab', color: '#38bdf8' },
      { icon: '⚡', text: 'Real-Time AI', color: '#10b981' },
      { icon: '💼', text: 'Office Suite', color: '#fbbf24' },
    ];
  }
  if (cat.includes('business') || text.includes('ipo') || text.includes('invest') || text.includes('nasdaq')) {
    return [
      { icon: '💰', text: 'Capital Growth', color: '#38bdf8' },
      { icon: '🌐', text: 'Enterprise Scale', color: '#10b981' },
      { icon: '📊', text: 'Nasdaq Listed', color: '#fbbf24' },
    ];
  }
  if (cat.includes('research') || text.includes('paper') || text.includes('quantum') || text.includes('science')) {
    return [
      { icon: '🧪', text: 'Verified Proof', color: '#38bdf8' },
      { icon: '💡', text: 'Breakthrough', color: '#10b981' },
      { icon: '📚', text: 'Published Study', color: '#fbbf24' },
    ];
  }
  return [
    { icon: '🚀', text: 'Production Scale', color: '#38bdf8' },
    { icon: '🎯', text: 'Real-World Impact', color: '#10b981' },
    { icon: '🤖', text: 'Agent Ready', color: '#fbbf24' },
  ];
}

function resolveScene2CategoryTag(story: FeedCard): string {
  const cat = (story.category || '').toLowerCase();
  const text = (story.headline + ' ' + story.summary).toLowerCase();
  if (cat.includes('product') || text.includes('meeting') || text.includes('tool')) return 'PRODUCT SPOTLIGHT';
  if (cat.includes('business') || text.includes('ipo') || text.includes('market')) return 'MARKET PULSE';
  if (cat.includes('research') || text.includes('science')) return 'SCIENCE BREAKTHROUGH';
  return 'TECH DEEP-DIVE';
}

export const DynamicVisualStage: React.FC<DynamicVisualStageProps> = ({ story, script }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene transition thresholds (in frames)
  // Scene 1 (Hook / Overview): 0 -> 33% of video
  // Scene 2 (Feature Breakdown): 33% -> 66% of video
  // Scene 3 (Impact & Conclusion): 66% -> End of video (clean ending right on the news!)
  const scene1End = Math.floor(durationInFrames * 0.33);
  const scene2End = Math.floor(durationInFrames * 0.66);

  // Active scene determination
  let currentScene: 1 | 2 | 3 = 1;
  if (frame >= scene2End) {
    currentScene = 3;
  } else if (frame >= scene1End) {
    currentScene = 2;
  }

  // Dynamic context-aware badges
  const scene2Badges = resolveScene2Badges(story, script);
  const scene3Tags = resolveScene3Tags(story, script);
  const scene2CategoryTag = resolveScene2CategoryTag(story);

  // -------------------------------------------------------------
  // ANIMATIONS FOR SCENE 1 (HERO PHOTO + CYBER HUD)
  // -------------------------------------------------------------
  const s1Entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
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

  // Resolvers for scene headlines and mockup metadata
  const scene2Title = script.scene2Title || 'Autonomous Capabilities & Real-Time Workflow';
  const scene3Title = script.scene3Title || 'Enterprise Rollout & Bank-Grade Security';

  const scene2Ui = {
    appTitle: script.scene2Ui?.appTitle || `${story.sourceName} • Feature Canvas`,
    agentAction: script.scene2Ui?.agentAction || 'Autonomous Agent Task Execution',
    featureMetric: script.scene2Ui?.featureMetric || 'Tokenized Protection',
    status: script.scene2Ui?.status || 'AGENT ACTIVE',
  };

  const scene3Ui = {
    metricValue: script.scene3Ui?.metricValue || '100%',
    metricLabel: script.scene3Ui?.metricLabel || 'Protected & Verified',
    rolloutStage: script.scene3Ui?.rolloutStage || 'Production Rollout',
  };

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
          { label: '03 IMPACT', active: currentScene === 3, done: false },
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
            {/* Ambient Blurred Background (fills canvas nicely without black voids) */}
            <Img
              src={story.imageUrl}
              style={{
                position: 'absolute',
                inset: -20,
                width: 'calc(100% + 40px)',
                height: 'calc(100% + 40px)',
                objectFit: 'cover',
                filter: 'blur(35px) brightness(0.35)',
                opacity: 0.7,
              }}
            />

            {/* Crisp Foreground Photo (100% visible, never cut off or cropped) */}
            <Img
              src={story.imageUrl}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                zIndex: 10,
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
                zIndex: 25,
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
                zIndex: 25,
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
                zIndex: 25,
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
                zIndex: 25,
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
                zIndex: 25,
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
                zIndex: 25,
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
      {/* SCENE 2: CORE POINT 1 - INTERACTIVE APP & FEATURE CANVAS */}
      {/* ========================================================= */}
      {currentScene === 2 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            transform: `scale(${s2Entrance})`,
            opacity: s2ExitProgress,
            transformOrigin: 'center center',
          }}
        >
          {/* Visual App Container */}
          <div
            style={{
              position: 'relative',
              width: 960,
              height: 520,
              borderRadius: 32,
              backgroundColor: '#0c0f1a',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Ambient Background Gradient Glow */}
            <div
              style={{
                position: 'absolute',
                top: -80,
                right: -80,
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
                filter: 'blur(45px)',
              }}
            />

            {/* HUD Corner Tech Brackets */}
            <div style={{ position: 'absolute', top: 16, left: 16, width: 20, height: 20, borderTop: '2.5px solid #38bdf8', borderLeft: '2.5px solid #38bdf8', zIndex: 25 }} />
            <div style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderTop: '2.5px solid #38bdf8', borderRight: '2.5px solid #38bdf8', zIndex: 25 }} />
            <div style={{ position: 'absolute', bottom: 16, left: 16, width: 20, height: 20, borderBottom: '2.5px solid #38bdf8', borderLeft: '2.5px solid #38bdf8', zIndex: 25 }} />
            <div style={{ position: 'absolute', bottom: 16, right: 16, width: 20, height: 20, borderBottom: '2.5px solid #38bdf8', borderRight: '2.5px solid #38bdf8', zIndex: 25 }} />

            {/* Window Header Bar */}
            <div
              style={{
                height: 54,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                zIndex: 20,
              }}
            >
              {/* Traffic light window controls */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#eab308' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              </div>

              {/* Title Bar Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <span>⚡</span>
                <span>{scene2Ui.appTitle}</span>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#10b981',
                  letterSpacing: '0.08em',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                {scene2Ui.status}
              </div>
            </div>

            {/* Interactive Feature Canvas Body */}
            <div
              style={{
                flex: 1,
                padding: '24px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 20,
              }}
            >
              {/* Agent Command & Action Stream */}
              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 20,
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {/* Agent Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                      }}
                    >
                      🤖
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>AUTONOMOUS AGENT RUNTIME</div>
                      <div style={{ fontSize: 17, color: '#f1f5f9', fontWeight: 800 }}>{scene2CategoryTag}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    VERIFIED SECURE
                  </div>
                </div>

                {/* Simulated Action Prompt */}
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{ color: '#38bdf8', fontSize: 20, fontWeight: 800 }}>&gt;</span>
                  <span style={{ color: '#e2e8f0', fontSize: 18, fontWeight: 700 }}>{scene2Ui.agentAction}</span>
                </div>
              </div>

              {/* Feature Highlight Metric Pills */}
              <div style={{ display: 'flex', gap: 16 }}>
                {scene2Badges.map((badge, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      padding: '14px 20px',
                      borderRadius: 18,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 24,
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: `${badge.color}26`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em' }}>
                        {badge.label}
                      </div>
                      <div style={{ fontSize: 18, color: '#ffffff', fontWeight: 800 }}>
                        {badge.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Headline Below App Container (Punchy 3-5 words, no narration repetition!) */}
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
            {scene2Title}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCENE 3: CORE POINT 2 - IMPACT & TELEMETRY DASHBOARD     */}
      {/* ========================================================= */}
      {currentScene === 3 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            transform: `scale(${s3Entrance})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Visual App Container */}
          <div
            style={{
              position: 'relative',
              width: 960,
              height: 520,
              borderRadius: 32,
              backgroundColor: '#0e0d1a',
              border: '1.5px solid rgba(168, 85, 247, 0.45)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Ambient Background Violet Glow */}
            <div
              style={{
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)',
                filter: 'blur(45px)',
              }}
            />

            {/* HUD Corner Tech Brackets (Violet theme) */}
            <div style={{ position: 'absolute', top: 16, left: 16, width: 20, height: 20, borderTop: '2.5px solid #a855f7', borderLeft: '2.5px solid #a855f7', zIndex: 25 }} />
            <div style={{ position: 'absolute', top: 16, right: 16, width: 20, height: 20, borderTop: '2.5px solid #a855f7', borderRight: '2.5px solid #a855f7', zIndex: 25 }} />
            <div style={{ position: 'absolute', bottom: 16, left: 16, width: 20, height: 20, borderBottom: '2.5px solid #a855f7', borderLeft: '2.5px solid #a855f7', zIndex: 25 }} />
            <div style={{ position: 'absolute', bottom: 16, right: 16, width: 20, height: 20, borderBottom: '2.5px solid #a855f7', borderRight: '2.5px solid #a855f7', zIndex: 25 }} />

            {/* Window Header Bar */}
            <div
              style={{
                height: 54,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                zIndex: 20,
              }}
            >
              {/* Traffic light window controls */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#eab308' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              </div>

              {/* Title Bar Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 16px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#a855f7',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <span>📊</span>
                <span>Impact Telemetry &amp; Rollout</span>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#a855f7',
                  letterSpacing: '0.08em',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
                {scene3Ui.rolloutStage}
              </div>
            </div>

            {/* Impact Dashboard Canvas Body */}
            <div
              style={{
                flex: 1,
                padding: '24px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                zIndex: 20,
              }}
            >
              {/* 2 Big Visual Hero Metric Cards */}
              <div style={{ display: 'flex', gap: 20 }}>
                {/* Metric Card 1 */}
                <div
                  style={{
                    flex: 1,
                    padding: '20px 24px',
                    borderRadius: 20,
                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      letterSpacing: '-0.02em',
                      background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {scene3Ui.metricValue}
                  </div>
                  <div style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {scene3Ui.metricLabel}
                  </div>
                </div>

                {/* Metric Card 2 */}
                <div
                  style={{
                    flex: 1,
                    padding: '20px 24px',
                    borderRadius: 20,
                    backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 900,
                      letterSpacing: '-0.02em',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>⚡</span> READY
                  </div>
                  <div style={{ fontSize: 14, color: '#cbd5e1', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {scene3Ui.rolloutStage}
                  </div>
                </div>
              </div>

              {/* 3 Key Takeaway Badges */}
              <div style={{ display: 'flex', gap: 14 }}>
                {scene3Tags.map((badge, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 16,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{badge.icon}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Headline Below App Container (Punchy 3-5 words, no narration repetition!) */}
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
            {scene3Title}
          </div>
        </div>
      )}
    </div>
  );
};

