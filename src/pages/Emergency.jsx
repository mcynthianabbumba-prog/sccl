import { useState, useEffect } from 'react'
import { Phone, MapPin, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout/Layout'
import { Card, Spinner } from '../components/ui'

const CATEGORY_CONFIG = {
  ambulance: {
    label: 'Ambulance Services',
    icon: '🚑',
    color: '#dc2626',
    bg: '#fef2f2',
    borderColor: '#dc2626',
  },
  scd_hotline: {
    label: 'SCD Crisis Hotlines',
    icon: '📞',
    color: '#2563eb',
    bg: 'var(--blue-50)',
    borderColor: 'var(--accent-primary)',
  },
  hospital_triage: {
    label: 'Hospital Triage Units',
    icon: '🏥',
    color: '#16a34a',
    bg: '#f0fdf4',
    borderColor: '#16a34a',
  },
}

export default function EmergencyPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      setContacts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const grouped = contacts.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {})

  return (
    <Layout>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Location breadcrumb */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'var(--accent-primary)', marginBottom: '12px',
          fontWeight: 600,
        }}>
          <MapPin size={13} /> Mukono District
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 800, marginBottom: '8px',
        }}>
          Emergency Contacts
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '36px', lineHeight: 1.6 }}>
          Immediate help lines for critical response, SCD crisis management, and local hospital triage units.
        </p>

        {/* Emergency Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px',
          marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ fontSize: '28px', flexShrink: 0 }}>🚨</div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
              In a life-threatening emergency, call 999 immediately
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
              The contacts below are for SCD-specific care and non-critical situations.
            </p>
          </div>
          <a href="tel:999" style={{
            marginLeft: 'auto', flexShrink: 0,
            background: 'white', color: '#dc2626',
            padding: '8px 18px', borderRadius: 'var(--radius-full)',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Phone size={14} /> 999
          </a>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner size={32} color="var(--accent-primary)" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
              const items = grouped[cat] || []
              if (items.length === 0) return null
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{
                      width: 4, height: 24, background: config.color,
                      borderRadius: 'var(--radius-full)',
                    }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
                      {config.label}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {items.map(contact => (
                      <ContactCard key={contact.id} contact={contact} config={config} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Map Banner */}
        <div style={{
          marginTop: '40px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-xl)',
          height: '160px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '6px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M0 30 Q15 10 30 30 Q45 50 60 30' stroke='%23bfdbfe' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
            opacity: 0.5,
          }} />
          <div style={{ fontSize: '24px', position: 'relative' }}>📡</div>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', position: 'relative' }}>
            Mukono District Emergency Network
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', position: 'relative' }}>
            Connecting 20+ response units in real-time
          </p>
        </div>
      </div>
    </Layout>
  )
}

function ContactCard({ contact, config }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px',
      transition: 'all var(--transition-fast)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = config.color
      e.currentTarget.style.boxShadow = `0 0 0 3px ${config.color}15`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border-color)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: config.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0,
        }}>
          {config.icon}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
            {contact.name}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {contact.description}
          </p>
        </div>
      </div>
      <a
        href={`tel:${contact.phone}`}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--accent-primary)', color: 'white',
          padding: '10px 20px', borderRadius: 'var(--radius-md)',
          fontSize: '14px', fontWeight: 700, textDecoration: 'none',
          flexShrink: 0, fontFamily: 'var(--font-body)',
          transition: 'background var(--transition-fast)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-primary-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-primary)'}
      >
        <Phone size={14} /> Call Now
      </a>
    </div>
  )
}
