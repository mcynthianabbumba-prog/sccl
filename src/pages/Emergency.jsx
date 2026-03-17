// src/pages/Emergency.jsx
import React, { useEffect, useState } from 'react';
import { Phone, Ambulance, AlertCircle, Hospital } from 'lucide-react';
import { getEmergencyContacts } from '../lib/supabase';
import { Card, Spinner } from '../components/ui';

const CATEGORY_META = {
  ambulance:       { label: 'Ambulance Services', icon: Ambulance, color: 'var(--blue)' },
  scd_hotline:     { label: 'SCD Crisis Hotlines', icon: AlertCircle, color: 'var(--red)' },
  hospital_triage: { label: 'Hospital Triage Units', icon: Hospital, color: 'var(--green)' },
};

const ContactRow = ({ contact }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', marginBottom: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Phone size={18} color="var(--blue)" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--gray-900)' }}>{contact.name}</div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 1 }}>{contact.subtitle}</div>
      </div>
    </div>
    <a href={`tel:${contact.phone}`}>
      <button style={{
        background: 'var(--blue)', color: '#fff', border: 'none',
        padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 14,
        fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: 'pointer',
      }}>Call Now</button>
    </a>
  </div>
);

export const Emergency = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmergencyContacts().then(({ data }) => {
      setContacts(data || []);
      setLoading(false);
    });
  }, []);

  const grouped = contacts.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          📍 Mukono District
        </div>
        <h1 style={{ fontSize: 32, marginBottom: 10 }}>Emergency Contacts</h1>
        <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.6 }}>
          Immediate help lines for critical response, SCD crisis management, and local hospital triage units.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
      ) : (
        Object.entries(CATEGORY_META).map(([key, { label, color }]) => (
          grouped[key] ? (
            <div key={key} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 4, height: 24, background: color, borderRadius: 2 }} />
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{label}</h2>
              </div>
              {grouped[key].map(c => <ContactRow key={c.id} contact={c} />)}
            </div>
          ) : null
        ))
      )}

      {/* Map banner */}
      <div style={{
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative',
        height: 160, background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="100%" height="100%" viewBox="0 0 600 160" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
          <path d="M0 40 Q150 20 300 50 Q450 80 600 40" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M0 80 Q100 60 300 90 Q500 120 600 80" stroke="white" strokeWidth="1" fill="none"/>
          <path d="M200 0 Q210 80 215 160" stroke="white" strokeWidth="1" fill="none"/>
          <path d="M380 0 Q390 80 395 160" stroke="white" strokeWidth="1" fill="none"/>
        </svg>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📍</div>
          <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 4 }}>Mukono District Emergency Network</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Connecting 20+ response units in real-time</p>
        </div>
      </div>
    </div>
  );
};
