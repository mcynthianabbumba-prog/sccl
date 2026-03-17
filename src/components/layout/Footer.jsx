import { Link } from 'react-router-dom'
import { Activity, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
    }}>
      <div className="container" style={{ padding: '48px 24px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Activity size={18} color="white" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>
                  SCCL
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1 }}>Uganda</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '240px' }}>
              Connecting sickle cell patients to specialized care across Mukono District and Uganda.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {['📘', '🐦', '📸'].map((icon, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', cursor: 'pointer',
                }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Resources
            </h4>
            {[
              { to: '/search', label: 'Find a Facility' },
              { to: '/map', label: 'Interactive Map' },
              { to: '/emergency', label: 'Emergency Contacts' },
              { to: '/how-it-works', label: 'How It Works' },
            ].map(({ to, label }) => (
              <Link
                key={to} to={to}
                style={{
                  display: 'block', fontSize: '13px', color: 'var(--text-secondary)',
                  marginBottom: '10px', textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* About */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              About SCCL
            </h4>
            {[
              { to: '/about', label: 'Our Mission' },
              { to: '/about', label: 'Medical Board' },
              { to: '/about', label: 'Partnerships' },
              { to: '/about', label: 'Contact Support' },
            ].map(({ to, label }) => (
              <Link
                key={label} to={to}
                style={{
                  display: 'block', fontSize: '13px', color: 'var(--text-secondary)',
                  marginBottom: '10px', textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Contact
            </h4>
            {[
              { icon: <MapPin size={13} />, text: 'Mukono District, Uganda' },
              { icon: <Phone size={13} />, text: '+256 800 100 200' },
              { icon: <Mail size={13} />, text: 'support@sccl.ug' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          paddingTop: '24px', borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © 2026 SCCL Uganda. All health facility data is verified by Ministry of Health.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy Policy', 'Terms of Service', 'Accessibility'].map(label => (
              <a key={label} href="#" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
