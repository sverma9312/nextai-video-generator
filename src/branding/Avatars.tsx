import React from 'react';

// Canvas: 1024 x 1024
// Safe circular crop: radius 460px from center (512, 512)

// ==========================================
// OPTION 1: "THE LINEAR SPEED MONOGRAM"
// Inspired by: Linear, Raycast, Vercel
// Concept: Sleek geometric "A" with a diagonal speed cut & electric cyan "i"
// ==========================================
export const Option1Velocity: React.FC = () => {
  return (
    <div
      style={{
        width: 1024,
        height: 1024,
        backgroundColor: '#090D16',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Inter, Arial, sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Subtle outer circular framing ring */}
      <div
        style={{
          position: 'absolute',
          width: 920,
          height: 920,
          borderRadius: '50%',
          border: '1.5px solid rgba(56, 189, 248, 0.12)',
        }}
      />

      {/* SVG Logomark */}
      <svg
        width="440"
        height="360"
        viewBox="0 0 440 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: 36 }}
      >
        <defs>
          <linearGradient id="opt1-cyan" x1="40" y1="40" x2="360" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>

        {/* Clean geometric 'A' */}
        {/* Left diagonal leg */}
        <path
          d="M 180 50 L 50 330 L 115 330 L 180 175 Z"
          fill="#FFFFFF"
        />
        {/* Right diagonal leg */}
        <path
          d="M 180 50 L 310 330 L 245 330 L 180 175 Z"
          fill="#FFFFFF"
        />
        {/* Speed slash crossbar cutting forward through the right leg */}
        <path
          d="M 110 240 L 370 240 L 335 190 L 132 190 Z"
          fill="url(#opt1-cyan)"
        />

        {/* The 'i' column */}
        <rect
          x="355"
          y="120"
          width="44"
          height="210"
          rx="10"
          fill="url(#opt1-cyan)"
        />
        {/* The 'i' electric dot */}
        <circle
          cx="377"
          cy="70"
          r="22"
          fill="#38BDF8"
        />
      </svg>

      {/* Brand Typography */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
          }}
        >
          AI NEWS
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div style={{ width: 40, height: 2, backgroundColor: 'rgba(56, 189, 248, 0.4)' }} />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.36em',
              color: '#38BDF8',
              textTransform: 'uppercase',
            }}
          >
            IN SHORT DAILY
          </div>
          <div style={{ width: 40, height: 2, backgroundColor: 'rgba(56, 189, 248, 0.4)' }} />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// OPTION 2: "THE SWISS NEWSROOM"
// Inspired by: Axios, Bloomberg QuickTake, Financial Times
// Concept: Ultra-bold contrast typography with live signal red pill
// ==========================================
export const Option2Editorial: React.FC = () => {
  return (
    <div
      style={{
        width: 1024,
        height: 1024,
        backgroundColor: '#07080A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Inter, Arial, sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Subtle outer circular framing */}
      <div
        style={{
          position: 'absolute',
          width: 920,
          height: 920,
          borderRadius: '50%',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
        }}
      />

      {/* Main typographic lockup */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          marginBottom: 32,
        }}
      >
        <span
          style={{
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            lineHeight: 0.9,
          }}
        >
          AI
        </span>

        {/* Stacked editorial badges */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '0.14em',
              padding: '10px 22px',
              borderRadius: 8,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
              }}
            />
            NEWS
          </div>
          <div
            style={{
              backgroundColor: '#1E293B',
              color: '#38BDF8',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.18em',
              padding: '8px 20px',
              borderRadius: 8,
              textAlign: 'center',
              textTransform: 'uppercase',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            DAILY
          </div>
        </div>
      </div>

      {/* Horizontal divider rule */}
      <div
        style={{
          width: 460,
          height: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          marginBottom: 24,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '0.34em',
          color: '#E2E8F0',
          textTransform: 'uppercase',
        }}
      >
        IN SHORT
      </div>
    </div>
  );
};

// ==========================================
// OPTION 3: "THE DYNAMIC PRISM"
// Inspired by: Framer, Stripe Press, Vercel Ship
// Concept: Precision isometric delta symbol representing fast news delivery
// ==========================================
export const Option3Prism: React.FC = () => {
  return (
    <div
      style={{
        width: 1024,
        height: 1024,
        backgroundColor: '#070A12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Inter, Arial, sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Subtle outer circular framing */}
      <div
        style={{
          position: 'absolute',
          width: 920,
          height: 920,
          borderRadius: '50%',
          border: '1.5px solid rgba(99, 102, 241, 0.15)',
        }}
      />

      {/* Flat geometric vector mark: Clean 3-facet folded prism */}
      <svg
        width="400"
        height="360"
        viewBox="0 0 400 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: 36 }}
      >
        {/* Left facet */}
        <polygon
          points="200,30 40,310 200,250"
          fill="#2563EB"
        />
        {/* Right facet */}
        <polygon
          points="200,30 360,310 200,250"
          fill="#6366F1"
        />
        {/* Center forward fold / chevron */}
        <polygon
          points="200,110 280,250 200,220 120,250"
          fill="#38BDF8"
        />
      </svg>

      {/* Brand Text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: '#FFFFFF',
          }}
        >
          AI NEWS
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.36em',
            color: '#38BDF8',
            textTransform: 'uppercase',
          }}
        >
          IN SHORT DAILY
        </div>
      </div>
    </div>
  );
};

// ==========================================
// OPTION 4: "THE MINIMALIST BROADCAST"
// Inspired by: Monocle, The Information, Apple Editorial
// Concept: Understated luxury, live emerald broadcast beacon, high readability
// ==========================================
export const Option4Minimalist: React.FC = () => {
  return (
    <div
      style={{
        width: 1024,
        height: 1024,
        backgroundColor: '#0E0F14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Inter, Arial, sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Outer subtle circular border with live dot */}
      <div
        style={{
          position: 'absolute',
          width: 880,
          height: 880,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.08)',
        }}
      />

      {/* Minimalist Central Monogram with Emerald Live Dot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: 36,
        }}
      >
        <span
          style={{
            fontSize: 220,
            fontWeight: 900,
            letterSpacing: '0.06em',
            color: '#FFFFFF',
            lineHeight: 1,
          }}
        >
          AI
        </span>

        {/* Electric Emerald Live Beacon */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: -24,
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.9)',
          }}
        />
      </div>

      {/* Pill Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 36px',
          borderRadius: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '0.24em',
            color: '#F8FAFC',
            textTransform: 'uppercase',
          }}
        >
          NEWS IN SHORT
        </span>
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.4em',
          color: '#64748B',
          textTransform: 'uppercase',
        }}
      >
        DAILY BRIEFING
      </div>
    </div>
  );
};
