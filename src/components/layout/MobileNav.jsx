// src/components/layout/MobileNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Search, Phone, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',         label: 'Home',      icon: Home },
  { to: '/map',      label: 'Map',       icon: Map },
  { to: '/search',   label: 'Search',    icon: Search },
  { to: '/emergency',label: 'Emergency', icon: Phone },
  { to: '/education',label: 'Learn',     icon: BookOpen },
];

export const MobileNav = () => {
  const { pathname } = useLocation();

  return (
    <>
      {/* Spacer so content isn't hidden behind nav */}
      <div style={{ height: 64 }} className="mobile-bottom-spacer" />

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: '#fff', borderTop: '1px solid var(--gray-200)',
        display: 'flex', height: 64,
        boxShadow: '0 -4px 16px rgba(0,0,0,.06)',
      }} className="mobile-bottom-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                color: active ? 'var(--blue)' : 'var(--gray-400)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                letterSpacing: '0.02em',
              }}>
                {label}
              </span>
              {active && (
                <div style={{
                  position: 'absolute', bottom: 0,
                  width: 32, height: 3, background: 'var(--blue)',
                  borderRadius: '2px 2px 0 0',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      <style>{`
        .mobile-bottom-nav   { display: none; }
        .mobile-bottom-spacer{ display: none; }
        @media (max-width: 768px) {
          .mobile-bottom-nav    { display: flex !important; }
          .mobile-bottom-spacer { display: block !important; }
        }
      `}</style>
    </>
  );
};
