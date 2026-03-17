// src/components/ui/LoadingScreen.jsx
import React from 'react';

export const LoadingScreen = ({ message = 'Loading…' }) => (
  <div style={{
    position: 'fixed', inset: 0, background: '#fff', zIndex: 9998,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 20,
  }}>
    {/* Logo mark */}
    <div style={{
      width: 56, height: 56, background: 'var(--blue)', borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(29,78,216,.3)',
      animation: 'pulse 1.8s ease-in-out infinite',
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="white"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>

    {/* Progress bar */}
    <div style={{ width: 160, height: 3, background: 'var(--gray-100)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%', background: 'var(--blue)', borderRadius: 2,
        animation: 'loading-bar 1.4s ease-in-out infinite',
      }} />
    </div>

    <p style={{ fontSize: 13, color: 'var(--gray-400)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      {message}
    </p>

    <style>{`
      @keyframes pulse {
        0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(29,78,216,.3); }
        50%       { transform: scale(1.06); box-shadow: 0 12px 32px rgba(29,78,216,.45); }
      }
      @keyframes loading-bar {
        0%   { width: 0%;   margin-left: 0; }
        50%  { width: 70%;  margin-left: 0; }
        100% { width: 0%;   margin-left: 100%; }
      }
    `}</style>
  </div>
);
