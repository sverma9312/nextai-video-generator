import React from 'react';

export interface NewsPosterProps {
  [key: string]: unknown;
  headline: string;
  topicKicker?: string;
  category: string;
  sourceName: string;
  dateStr: string;
  imageUrl?: string;
  summaryText?: string;
}

export const NewsPoster: React.FC<NewsPosterProps> = ({
  headline,
  topicKicker = 'AI BREAKTHROUGH',
  category = 'PRODUCTIVITY',
  sourceName = 'TECHCRUNCH',
  dateStr = 'NOV 20, 2026',
  imageUrl,
  summaryText,
}) => {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        backgroundColor: '#07080C',
        color: '#FFFFFF',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '120px 80px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Ambient Radial Glows */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(7, 8, 12, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: -200,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(7, 8, 12, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Background Subtle Tech Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '48px 48px',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Decorative Outer Cyber Frame */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none',
        }}
      >
        {/* Corner Accents */}
        <div style={{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderTop: '3px solid #38BDF8', borderLeft: '3px solid #38BDF8' }} />
        <div style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderTop: '3px solid #38BDF8', borderRight: '3px solid #38BDF8' }} />
        <div style={{ position: 'absolute', bottom: -2, left: -2, width: 24, height: 24, borderBottom: '3px solid #C084FC', borderLeft: '3px solid #C084FC' }} />
        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderBottom: '3px solid #C084FC', borderRight: '3px solid #C084FC' }} />
      </div>

      {/* ========================================================= */}
      {/* TOP HEADER BAR */}
      {/* ========================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        {/* Brand identity pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.4)',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 900, color: '#07080C' }}>AI</span>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '0.05em' }}>
              AISHORT <span style={{ color: '#38BDF8' }}>DAILY</span>
            </div>
            <div style={{ fontSize: 13, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              VERIFIED AI INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Category Pill */}
        <div
          style={{
            padding: '10px 22px',
            borderRadius: 30,
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38BDF8',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38BDF8', boxShadow: '0 0 10px #38BDF8' }} />
          {category}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CENTER PIECE (OPTIMIZED FOR 1:1 INSTAGRAM GRID CROP) */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 10,
          margin: 'auto 0',
        }}
      >
        {/* Eyebrow Label */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.28em',
            color: '#C084FC',
            textTransform: 'uppercase',
            marginBottom: 28,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(192, 132, 252, 0.1)',
            padding: '8px 24px',
            borderRadius: 20,
            border: '1px solid rgba(192, 132, 252, 0.25)',
          }}
        >
          <span>⚡</span>
          <span>{topicKicker}</span>
        </div>

        {/* Massive Editorial Headline */}
        <h1
          style={{
            fontSize: 76,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 0 36px 0',
            textWrap: 'balance',
            background: 'linear-gradient(180deg, #FFFFFF 20%, #CBD5E1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
          }}
        >
          {headline}
        </h1>

        {/* Feature Visual / Image Card */}
        {imageUrl ? (
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 900,
              height: 440,
              borderRadius: 28,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)',
              margin: '12px 0 32px 0',
            }}
          >
            <img
              src={imageUrl}
              alt={headline}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.92) contrast(1.08)',
              }}
            />
            {/* Top gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(7, 8, 12, 0.1) 0%, rgba(7, 8, 12, 0.6) 100%)',
              }}
            />
            {/* Corner Badge */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                padding: '6px 16px',
                borderRadius: 20,
                letterSpacing: '0.1em',
              }}
            >
              ● BREAKING
            </div>
            {/* Source Pill */}
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                background: 'rgba(7, 8, 12, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#E2E8F0',
                fontSize: 15,
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: 20,
              }}
            >
              Reported by <span style={{ color: '#38BDF8' }}>{sourceName}</span>
            </div>
          </div>
        ) : null}

        {/* Clean Editorial Summary Line */}
        {summaryText ? (
          <p
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: '#94A3B8',
              fontWeight: 500,
              maxWidth: 860,
              margin: 0,
            }}
          >
            {summaryText}
          </p>
        ) : null}
      </div>

      {/* ========================================================= */}
      {/* BOTTOM FOOTER BAR */}
      {/* ========================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: 36,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 16, color: '#64748B', fontWeight: 600, letterSpacing: '0.08em' }}>
            📅 {dateStr}
          </span>
          <span style={{ fontSize: 16, color: '#64748B' }}>·</span>
          <span style={{ fontSize: 16, color: '#34D399', fontWeight: 700, letterSpacing: '0.08em' }}>
            ⏱ 60-SEC REEL
          </span>
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>aishort.nextai-apps.com</span>
          <span style={{ color: '#38BDF8' }}>↗</span>
        </div>
      </div>
    </div>
  );
};
