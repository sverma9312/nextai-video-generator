import React from 'react';

/**
 * Bottom Brand Pill:
 * Displays persistent branding at the bottom of the video without intrusive CTAs.
 */
export const OutroCard: React.FC = () => {
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
        backgroundColor: 'rgba(15, 18, 28, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        zIndex: 70,
      }}
    >
      <span
        style={{
          color: '#cbd5e1',
          fontSize: 22,
          fontWeight: 600,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.02em',
        }}
      >
        Daily AI News in 60 Words • <span style={{ color: '#38bdf8', fontWeight: 700 }}>aishort.nextai-apps.com</span>
      </span>
    </div>
  );
};

