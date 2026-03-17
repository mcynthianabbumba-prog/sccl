// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer style={{ background: '#fff', borderTop: '1px solid var(--gray-200)', marginTop: 'auto' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--gray-800)', fontSize: 14 }}>SCCL Mukono</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Privacy Policy', 'Terms of Service', 'Accessibility'].map(t => (
          <Link key={t} to="#" style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t}</Link>
        ))}
      </div>
      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>© 2026 SCCL Platform Mukono District</span>
    </div>
  </footer>
);
