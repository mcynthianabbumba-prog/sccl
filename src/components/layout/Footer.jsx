import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Phone, Mail, MapPin, ChevronDown } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Resources',
    links: [
      { to: '/search',       label: 'Find a Facility' },
      { to: '/map',          label: 'Interactive Map' },
      { to: '/emergency',    label: 'Emergency Contacts' },
      { to: '/how-it-works', label: 'How It Works' },
    ],
  },
  {
    title: 'About SCCL',
    links: [
      { to: '/about', label: 'Our Mission' },
      { to: '/about', label: 'Medical Board' },
      { to: '/about', label: 'Partnerships' },
      { to: '/about', label: 'Contact Support' },
    ],
  },
]

const CONTACT = [
  { icon: <MapPin size={13} />, text: 'Mukono District, Uganda' },
  { icon: <Phone  size={13} />, text: '+256 800 100 200' },
  { icon: <Mail   size={13} />, text: 'support@sccl.ug' },
]

/* Collapsible section used only on mobile */
function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="footer-collapsible">
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 0',
          borderBottom: open ? 'none' : '1px solid var(--border-color)',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '14px',
          fontWeight: 700, color: 'var(--text-primary)',
        }}>
          {title}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
      {open && (
        <div style={{ paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 28px' }}>

        {/* ── Desktop layout ── */}
        <div className="footer-desktop">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: '40px',
            marginBottom: '36px',
          }}>
            {/* Brand column */}
            <div>
              <Brand />
            </div>

            {/* Link columns */}
            {SECTIONS.map(s => (
              <div key={s.title}>
                <h4 style={{
                  fontFamily: 'var(--font-display)', fontSize: '13px',
                  fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)',
                  letterSpacing: '0.02em',
                }}>
                  {s.title}
                </h4>
                {s.links.map(({ to, label }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </div>
            ))}

            {/* Contact column */}
            <div>
              <h4 style={{
                fontFamily: 'var(--font-display)', fontSize: '13px',
                fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)',
              }}>
                Contact
              </h4>
              {CONTACT.map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px',
                }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile layout ── */}
        <div className="footer-mobile">
          {/* Brand — always visible */}
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
            <Brand compact />
          </div>

          {/* Collapsible sections */}
          {SECTIONS.map(s => (
            <CollapsibleSection key={s.title} title={s.title}>
              <div style={{ paddingTop: '10px' }}>
                {s.links.map(({ to, label }) => (
                  <FooterLink key={label} to={to} label={label} />
                ))}
              </div>
            </CollapsibleSection>
          ))}

          <CollapsibleSection title="Contact">
            <div style={{ paddingTop: '10px' }}>
              {CONTACT.map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px',
                }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        {/* ── Bottom bar — shared ── */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '10px',
          marginTop: '20px',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            © 2026 SCCL Uganda · Health data verified by Ministry of Health
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy', 'Terms', 'Accessibility'].map(label => (
              <a key={label} href="#" style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-mobile  { display: none; }
        .footer-desktop { display: block; }

        @media (max-width: 768px) {
          .footer-mobile  { display: block; }
          .footer-desktop { display: none; }
        }

        /* Tighten footer padding on small screens */
        @media (max-width: 480px) {
          footer .container {
            padding-top: 24px !important;
            padding-bottom: 20px !important;
          }
        }
      `}</style>
    </footer>
  )
}

function FooterLink({ to, label }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block', fontSize: '13px', color: 'var(--text-secondary)',
        marginBottom: '10px', textDecoration: 'none',
        transition: 'color var(--transition-fast)',
      }}
      onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
      onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
    >
      {label}
    </Link>
  )
}

function Brand({ compact = false }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: compact ? '10px' : '14px' }}>
        <div style={{
          width: 34, height: 34,
          background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
          borderRadius: '9px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Activity size={17} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--text-primary)', lineHeight: 1 }}>
            SCCL
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>Uganda</div>
        </div>
      </div>
      {!compact && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '240px' }}>
          Connecting sickle cell patients to specialized care across Mukono District.
        </p>
      )}
      <div style={{ display: 'flex', gap: '8px', marginTop: compact ? '0' : '14px' }}>
        {['📘', '🐦', '📸'].map((icon, i) => (
          <div key={i} style={{
            width: 30, height: 30, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', cursor: 'pointer',
          }}>
            {icon}
          </div>
        ))}
      </div>
    </div>
  )
}
