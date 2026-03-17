import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home, Map, Search, Phone, BookOpen, User, Moon, Sun,
  Menu, X, LogIn, LogOut, ChevronDown, Shield, Activity
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui'

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/emergency', label: 'Emergency', icon: Phone },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActive = (path) => path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(path)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 'var(--nav-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
      }}>
        <div className="container" style={{
          height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={18} color="white" />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px',
                color: 'var(--text-primary)', letterSpacing: '-0.02em',
              }}>
                SCCL
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', lineHeight: 1, marginTop: '-1px' }}>
                Uganda
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
               className="desktop-nav">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '14px', fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive(to) ? 'var(--blue-50)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => !isActive(to) && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => !isActive(to) && (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme Toggle */}
            <button
              onClick={toggle}
              style={{
                background: 'var(--bg-tertiary)', border: 'none',
                borderRadius: 'var(--radius-md)', padding: '8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                color: 'var(--text-secondary)', transition: 'all var(--transition-fast)',
              }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Auth */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)', padding: '6px 12px',
                    cursor: 'pointer', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '11px', fontWeight: 700,
                  }}>
                    {profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name || user.email}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    minWidth: '180px', overflow: 'hidden',
                    animation: 'scaleIn 0.15s ease',
                    transformOrigin: 'top right',
                  }}>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', textDecoration: 'none',
                        color: 'var(--text-primary)', fontSize: '14px',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={14} /> My Account
                    </Link>
                    {profile?.role === 'doctor' && (
                      <Link
                        to="/doctor"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 16px', textDecoration: 'none',
                          color: 'var(--text-primary)', fontSize: '14px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Shield size={14} /> Doctor Portal
                      </Link>
                    )}
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                    <button
                      onClick={handleSignOut}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 16px', width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--accent-emergency)', fontSize: '14px',
                        fontFamily: 'var(--font-body)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }} className="desktop-nav">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}
                  icon={<LogIn size={14} />}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'var(--bg-tertiary)', border: 'none',
                borderRadius: 'var(--radius-md)', padding: '8px',
                cursor: 'pointer', display: 'none', alignItems: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-height)', left: 0, right: 0,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 99, padding: '16px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                textDecoration: 'none', fontSize: '15px', fontWeight: 500,
                color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-primary)',
                background: isActive(to) ? 'var(--blue-50)' : 'transparent',
                marginBottom: '4px',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
            {user ? (
              <button
                onClick={handleSignOut}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', width: '100%',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent-emergency)', fontSize: '15px',
                  fontFamily: 'var(--font-body)', borderRadius: 'var(--radius-md)',
                }}
              >
                <LogOut size={18} /> Sign Out
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button variant="outline" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false) }}>
                  Sign In
                </Button>
                <Button variant="primary" fullWidth onClick={() => { navigate('/signup'); setMobileOpen(false) }}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
