// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Map, Search, Phone, BookOpen, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { signOut } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

const Logo = () => (
  <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
    <div style={{
      width: 34, height: 34, background: 'var(--blue)', borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="white"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>SCCL</span>
  </Link>
);

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/map',       label: 'Map',       icon: Map },
  { to: '/search',    label: 'Search',    icon: Search },
  { to: '/emergency', label: 'Emergency', icon: Phone },
  { to: '/education', label: 'Education', icon: BookOpen },
];

export const Navbar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast('Failed to sign out', 'error');
    else {
      toast('Signed out successfully', 'success');
      navigate('/login');
    }
    setProfileOpen(false);
  };

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <style>{`
        .nav-link {
          color: var(--gray-600); font-size: 14px; font-weight: 500;
          padding: 6px 12px; border-radius: 6px; transition: all 0.15s;
          font-family: 'Plus Jakarta Sans',sans-serif; text-decoration: none; display: inline-block;
        }
        .nav-link:hover  { color: var(--blue); background: var(--blue-pale); }
        .nav-link.active { color: var(--blue); font-weight: 700; }
        .profile-dropdown { display: none; }
        .profile-trigger:hover .profile-dropdown,
        .profile-trigger:focus-within .profile-dropdown { display: block; }
      `}</style>

      <nav style={{
        background: '#fff', borderBottom: '1px solid var(--gray-200)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 8px rgba(0,0,0,.05)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Logo />

          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className={`nav-link${pathname === to ? ' active' : ''}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <div style={{ position: 'relative' }} className="profile-trigger">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--blue-pale)', border: '1.5px solid var(--blue-pale)',
                    borderRadius: 20, padding: '5px 12px 5px 6px', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={13} color="var(--blue)" />
                </button>

                {profileOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: 44, background: '#fff',
                      border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-lg)', minWidth: 200, zIndex: 300, overflow: 'hidden',
                    }}
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>
                        {user.user_metadata?.full_name || 'User'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{user.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: 'var(--gray-700)', fontSize: 14, textDecoration: 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={14} /> My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 16px', border: 'none', background: 'transparent',
                        color: 'var(--red)', fontSize: 14, cursor: 'pointer', borderTop: '1px solid var(--gray-100)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login">
                  <button style={{
                    padding: '7px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 6,
                    background: '#fff', color: 'var(--gray-700)', fontWeight: 600, fontSize: 13,
                    fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: 'pointer',
                  }}>Sign In</button>
                </Link>
                <Link to="/signup">
                  <button style={{
                    padding: '7px 16px', border: 'none', borderRadius: 6,
                    background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13,
                    fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: 'pointer',
                  }}>Get Started</button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-700)', display: 'none' }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid var(--gray-100)', padding: '12px 16px 16px', background: '#fff' }}>
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px',
                  borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                  color: pathname === to ? 'var(--blue)' : 'var(--gray-700)',
                  background: pathname === to ? 'var(--blue-pale)' : 'transparent',
                  fontWeight: pathname === to ? 700 : 400,
                  fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}
              >
                {Icon && <Icon size={16} />} {label}
              </Link>
            ))}
            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', color: 'var(--gray-700)', fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                <User size={16} /> My Profile
              </Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
};
