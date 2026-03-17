import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Phone, ArrowRight, Star, CheckCircle, AlertTriangle, Activity, Users, Stethoscope } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout/Layout'
import { Button, Card, Badge } from '../components/ui'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ hospitals: 45, diagnosis: 15, emergency: 8 })
  const [featuredHospitals, setFeaturedHospitals] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('hospitals')
        .select('*, hospital_services(*)')
        .eq('is_active', true)
        .eq('is_verified', true)
        .limit(3)
      if (data) setFeaturedHospitals(data)

      const { count: total } = await supabase.from('hospitals').select('*', { count: 'exact', head: true }).eq('is_active', true)
      const { count: emergency } = await supabase.from('hospitals').select('*', { count: 'exact', head: true }).eq('emergency_available', true)
      if (total) setStats(s => ({ ...s, hospitals: total, emergency: emergency || 8 }))
    }
    load()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    else navigate('/search')
  }

  const HeroStat = ({ icon: Icon, value, label, color }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-md)',
        background: color + '18', color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  )

  return (
    <Layout>
      {/* Hero */}
      <section style={{
        background: 'var(--bg-primary)',
        paddingTop: '72px', paddingBottom: '80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative bg */}
        <div style={{
          position: 'absolute', top: '-200px', right: '-100px',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, var(--blue-100) 0%, transparent 70%)',
          opacity: 0.6, pointerEvents: 'none',
        }} />

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}
               className="hero-grid">

            {/* Left */}
            <div className="animate-fade-in">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--blue-50)', border: '1px solid var(--blue-200)',
                borderRadius: 'var(--radius-full)', padding: '5px 14px',
                fontSize: '12px', fontWeight: 600, color: 'var(--blue-600)',
                marginBottom: '20px', letterSpacing: '0.04em',
              }}>
                <Activity size={12} /> MUKONO DISTRICT HEALTH NETWORK
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 800, lineHeight: 1.1,
                letterSpacing: '-0.03em',
                marginBottom: '20px',
                color: 'var(--text-primary)',
              }}>
                Sickle Cell Care{' '}
                <span style={{ color: 'var(--accent-primary)' }}>Locator</span>
              </h1>

              <p style={{
                fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.7,
                marginBottom: '32px', maxWidth: '480px',
              }}>
                Find specialized facilities and expert care for Sickle Cell Disease near you in Mukono District, Uganda.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch}>
                <div style={{
                  display: 'flex', gap: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-strong)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '6px 6px 6px 16px',
                  boxShadow: 'var(--shadow-md)',
                  maxWidth: '500px',
                }}>
                  <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'center' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search facilities, clinics, or services..."
                    style={{
                      flex: 1, border: 'none', background: 'none',
                      outline: 'none', fontSize: '14px',
                      color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                    }}
                  />
                  <Button type="submit" variant="primary" size="sm" style={{ borderRadius: '20px' }}>
                    Search
                  </Button>
                </div>
              </form>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                {['SCD Testing', 'Blood Transfusion', 'Pediatrics', 'Emergency'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?q=${tag}`)}
                    style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '12px', color: 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all var(--transition-fast)',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'var(--blue-50)'
                      e.target.style.color = 'var(--blue-600)'
                      e.target.style.borderColor = 'var(--blue-200)'
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'var(--bg-tertiary)'
                      e.target.style.color = 'var(--text-secondary)'
                      e.target.style.borderColor = 'var(--border-color)'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Map preview */}
            <div className="animate-fade-in-delay-1 hero-map">
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
              }}>
                <div style={{ height: '280px', background: 'linear-gradient(135deg, #e8f0fe, #c7d7fb)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M0 50 Q25 25 50 50 Q75 75 100 50' stroke='%23bfdbfe' stroke-width='1' fill='none'/%3E%3Cpath d='M0 70 Q25 45 50 70 Q75 95 100 70' stroke='%23bfdbfe' stroke-width='1' fill='none'/%3E%3Cpath d='M0 30 Q25 5 50 30 Q75 55 100 30' stroke='%23bfdbfe' stroke-width='1' fill='none'/%3E%3C/svg%3E\")", opacity: 0.7 }} />
                  <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🗺️</div>
                    <p style={{ fontSize: '14px', color: 'var(--blue-600)', fontWeight: 600 }}>Interactive Map</p>
                    <p style={{ fontSize: '12px', color: 'var(--blue-500)' }}>Showing {stats.hospitals} available facilities</p>
                  </div>
                  {/* Pins */}
                  {[
                    { top: '30%', left: '40%', emergency: false },
                    { top: '55%', left: '60%', emergency: true },
                    { top: '40%', left: '70%', emergency: false },
                  ].map((pin, i) => (
                    <div key={i} style={{
                      position: 'absolute', top: pin.top, left: pin.left,
                      width: 20, height: 20,
                      background: pin.emergency ? 'var(--accent-emergency)' : 'var(--accent-primary)',
                      borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
                      border: '2px solid white', boxShadow: 'var(--shadow-md)',
                    }} />
                  ))}
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
                      General Care
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emergency)', display: 'inline-block' }} />
                      Emergency
                    </span>
                  </div>
                  <Link to="/map" style={{
                    fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600,
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    Open Map <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px', marginTop: '48px',
          }} className="stats-grid">
            <HeroStat icon={Activity} value={stats.hospitals} label="Total Health Facilities" color="var(--accent-primary)" />
            <HeroStat icon={Stethoscope} value={stats.diagnosis} label="Diagnosis Services" color="var(--accent-secondary)" />
            <HeroStat icon={AlertTriangle} value={stats.emergency} label="24/7 Emergency Units" color="var(--accent-emergency)" />
          </div>
        </div>
      </section>

      {/* Featured Facilities */}
      <section style={{ padding: '64px 0', background: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
                Featured Facilities
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Recommended specialized centers in the district
              </p>
            </div>
            <Link to="/search" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', color: 'var(--accent-primary)', fontWeight: 600,
              textDecoration: 'none',
            }}>
              View All <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {featuredHospitals.length > 0 ? featuredHospitals.map(hospital => (
              <FacilityCard key={hospital.id} hospital={hospital} />
            )) : (
              // Placeholder skeletons
              [1, 2, 3].map(i => (
                <div key={i} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                }}>
                  <div className="skeleton" style={{ height: '160px' }} />
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '12px', width: '50%', marginBottom: '12px' }} />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2].map(j => <div key={j} className="skeleton" style={{ height: '20px', width: '70px' }} />)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Resources & Support */}
      <section style={{ padding: '64px 0', background: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            Resources & Support
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
            Everything you need to navigate sickle cell care in Mukono
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {[
              {
                icon: '📖', label: 'How It Works', color: '#2563eb',
                desc: 'Learn how to use the locator and navigate the healthcare system.',
                link: '/how-it-works', cta: 'Read Guide',
              },
              {
                icon: '📞', label: 'Emergency Contacts', color: '#dc2626',
                desc: 'Direct lines to emergency responders and hospital triage units.',
                link: '/emergency', cta: 'Get Numbers',
              },
              {
                icon: '🔬', label: 'SCD Information', color: '#0ea5e9',
                desc: 'Essential information about Sickle Cell management and prevention.',
                link: '/search', cta: 'Learn More',
              },
            ].map(({ icon, label, color, desc, link, cta }) => (
              <Card key={label} hover>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: color + '15', fontSize: '22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                  {label}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {desc}
                </p>
                <Link to={link} style={{
                  fontSize: '13px', fontWeight: 600, color,
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {cta} <ArrowRight size={13} />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hero-map { display: none; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}

function FacilityCard({ hospital }) {
  const services = hospital.hospital_services?.slice(0, 3) || []
  const isOpen = true // Would calculate from operating_hours

  return (
    <Link to={`/facility/${hospital.slug || hospital.id}`} style={{ textDecoration: 'none' }}>
      <Card hover padding={false}>
        <div style={{
          height: '160px',
          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {hospital.photo_url ? (
            <img src={hospital.photo_url} alt={hospital.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ fontSize: '40px' }}>🏥</div>
          )}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
          }}>
            <Badge variant={isOpen ? 'success' : 'default'} size="sm">
              {isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          </div>
          {hospital.emergency_available && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
            }}>
              <Badge variant="danger" size="sm">🚨 24/7</Badge>
            </div>
          )}
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {hospital.name}
            </h3>
            {hospital.is_verified && <CheckCircle size={15} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
            <MapPin size={11} /> {hospital.sub_county || hospital.address}
          </p>
          {services.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {services.map(s => (
                <Badge key={s.id} variant="primary" size="sm">
                  {s.service_type.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>→</span> View Profile
          </div>
        </div>
      </Card>
    </Link>
  )
}
