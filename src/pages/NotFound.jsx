// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Map } from 'lucide-react';

export const NotFound = () => (
  <div style={{
    minHeight: '70vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center',
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: '50%', background: 'var(--blue-pale)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    }}>
      <span style={{ fontSize: 36 }}>🔍</span>
    </div>
    <h1 style={{ fontSize: 28, marginBottom: 10 }}>Page not found</h1>
    <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 36, maxWidth: 380, lineHeight: 1.7 }}>
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to="/">
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          <Home size={15} /> Go Home
        </button>
      </Link>
      <Link to="/search">
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#fff', color: 'var(--blue)', border: '1.5px solid var(--blue)', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          <Search size={15} /> Search Facilities
        </button>
      </Link>
      <Link to="/map">
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: '#fff', color: 'var(--gray-600)', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          <Map size={15} /> View Map
        </button>
      </Link>
    </div>
  </div>
);
