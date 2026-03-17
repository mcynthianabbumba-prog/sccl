// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Stethoscope, Siren, ArrowRight, BookOpen, Phone, HelpCircle } from 'lucide-react';
import { getFeaturedFacilities, getFacilitiesStats } from '../lib/supabase';
import { Button, Badge, Card, Spinner } from '../components/ui';

// ─── Mini map thumbnail ───────────────────────────────────────────────────────
const MapThumbnail = () => (
  <div style={{
    background: '#e8f0e8', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    height: '100%', minHeight: 220, position: 'relative', display: 'flex', alignItems: 'flex-end',
  }}>
    {/* Placeholder map visual */}
    <svg width="100%" height="100%" viewBox="0 0 400 240" style={{ position: 'absolute', inset: 0 }}>
      <rect width="400" height="240" fill="#dde8dd"/>
      <path d="M0 80 Q100 60 200 90 Q300 120 400 80" stroke="#b8d4b8" strokeWidth="2" fill="none"/>
      <path d="M0 140 Q150 110 300 150 Q360 160 400 140" stroke="#b8d4b8" strokeWidth="2" fill="none"/>
      <path d="M120 0 Q130 80 140 140 Q145 190 150 240" stroke="#c8d8c8" strokeWidth="1.5" fill="none"/>
      <path d="M250 0 Q260 60 265 130 Q268 190 270 240" stroke="#c8d8c8" strokeWidth="1.5" fill="none"/>
      {/* Facility markers */}
      <circle cx="180" cy="110" r="8" fill="#1D4ED8" opacity="0.9"/>
      <circle cx="280" cy="90" r="6" fill="#10B981" opacity="0.9"/>
      <circle cx="140" cy="160" r="6" fill="#1D4ED8" opacity="0.9"/>
      <circle cx="320" cy="140" r="5" fill="#10B981" opacity="0.7"/>
    </svg>
    <div style={{
      position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.92)',
      margin: 12, borderRadius: 'var(--radius)', padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(4px)',
    }}>
      <MapPin size={16} color="var(--blue)" />
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Interactive Map</div>
        <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Showing 42 available facilities</div>
      </div>
    </div>
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <Card style={{ padding: 24, flex: 1, minWidth: 140 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon size={18} color={color} />
    </div>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--gray-900)', lineHeight: 1 }}>{value ?? '—'}</div>
    <Badge color={color === 'var(--red)' ? 'red' : color === 'var(--blue)' ? 'blue' : 'green'} style={{ marginTop: 6 }}>{sub}</Badge>
  </Card>
);

// ─── Facility card ────────────────────────────────────────────────────────────
const FacilityCard = ({ facility }) => {
  const navigate = useNavigate();
  const isOpen = true; // simplified
  return (
    <Card hover style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 160, background: 'var(--gray-100)', position: 'relative', overflow: 'hidden' }}>
        {facility.image_url ? (
          <img src={facility.image_url} alt={facility.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={40} color="var(--gray-300)" />
          </div>
        )}
        <Badge color={isOpen ? 'green' : 'red'} style={{ position: 'absolute', top: 10, right: 10 }}>
          {isOpen ? 'OPEN NOW' : 'CLOSING SOON'}
        </Badge>
      </div>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>{facility.name}</h3>
        {facility.tags?.slice(0, 3).map(tag => (
          <span key={tag} style={{ fontSize: 12, color: 'var(--gray-500)', display: 'block' }}>{tag}</span>
        ))}
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6 }}>
          {facility.opening_hours?.monday && `Mon–Fri: ${facility.opening_hours.monday}`}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gray-500)' }}>
            {facility.has_emergency && <Badge color="red" style={{ fontSize: 10 }}>Open 24/7</Badge>}
          </div>
          <Button size="sm" onClick={() => navigate(`/facility/${facility.id}`)}>Details</Button>
        </div>
      </div>
    </Card>
  );
};

// ─── Home page ────────────────────────────────────────────────────────────────
export const Home = () => {
  const [facilities, setFacilities] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getFeaturedFacilities(), getFacilitiesStats()]).then(([fac, st]) => {
      setFacilities(fac.data || []);
      setStats(st);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Mukono District Health Network</div>
            <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
              Sickle Cell Care<br />
              <span style={{ color: 'var(--blue)' }}>Locator</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--gray-500)', marginBottom: 28, lineHeight: 1.7 }}>
              Find specialized facilities and expert care for Sickle Cell Disease near you in Mukono District.
            </p>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search for health facilities, clinics, or services..."
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>
              <Button type="submit" size="lg">Search</Button>
            </form>
          </div>
          <div style={{ height: 280 }}>
            <Link to="/map" style={{ display: 'block', height: '100%' }}>
              <MapThumbnail />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatCard icon={Building2} label="Total Health Facilities" value={loading ? '…' : stats.totalFacilities} sub="Available" color="var(--blue)" />
          <StatCard icon={Stethoscope} label="Diagnosis Services" value={loading ? '…' : stats.diagnosisServices} sub="Specialized" color="var(--blue-light)" />
          <StatCard icon={Siren} label="Emergency Care" value={loading ? '…' : stats.emergencyCare} sub="24/7 Units" color="var(--red)" />
        </div>
      </section>

      {/* Featured Facilities */}
      <section style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22 }}>Featured Facilities</h2>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>Recommended specialized centers in the district</p>
          </div>
          <Link to="/search" style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {facilities.map(f => <FacilityCard key={f.id} facility={f} />)}
          </div>
        )}
      </section>

      {/* Resources */}
      <section style={{ maxWidth: 1200, margin: '0 auto 56px', padding: '0 24px', width: '100%' }}>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Resources & Support</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>Tools to help you navigate care</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { icon: HelpCircle, title: 'How it works', desc: 'Learn how to use the locator and navigate the healthcare system.', link: '/how-it-works', cta: 'Read Guide', color: 'var(--blue)' },
            { icon: Phone, title: 'Emergency Contacts', desc: 'Direct lines to emergency responders and hospital triage units.', link: '/emergency', cta: 'Get Numbers', color: 'var(--red)' },
            { icon: BookOpen, title: 'SCD Education', desc: 'Essential information about Sickle Cell management and prevention.', link: '/education', cta: 'Learn More', color: 'var(--blue-light)' },
          ].map(({ icon: Icon, title, desc, link, cta, color }) => (
            <Card key={title} hover style={{ padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
              <Link to={link} style={{ fontSize: 13, fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: 4 }}>
                {cta} <ArrowRight size={12} />
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
