import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Phone, MapPin, Clock, CheckCircle, Share2, Heart, ChevronLeft, ExternalLink, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout/Layout'
import FacilityMap from '../components/map/FacilityMap'
import { Badge, Card, Button, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const SICKLE_CELL_SERVICES = [
  { key: 'sickle_cell_testing', label: 'Sickle Cell Testing' },
  { key: 'lab_services', label: 'Laboratory Services' },
  { key: 'hydroxyurea_treatment', label: 'Hydroxyurea Treatment' },
  { key: 'pain_crisis_management', label: 'Pain Management' },
  { key: 'blood_transfusion', label: 'Blood Transfusion' },
  { key: 'pneumococcal_vaccines', label: 'Pneumococcal Vaccines' },
]

export default function FacilityPage() {
  const { id } = useParams()
  const [hospital, setHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [specialists, setSpecialists] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      // Try slug first, then fall back to UUID match
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const isUuid = uuidPattern.test(id)

      let query = supabase
        .from('hospitals')
        .select('*, hospital_services(*), hospital_specialists(*)')

      if (isUuid) {
        query = query.eq('id', id)
      } else {
        query = query.eq('slug', id)
      }

      const { data } = await query.maybeSingle()

      setHospital(data)
      setSpecialists(data?.hospital_specialists || [])
      setLoading(false)

      if (user && data) {
        const { data: fav } = await supabase
          .from('patient_favorites')
          .select('id').eq('patient_id', user.id).eq('hospital_id', data.id).single()
        setIsFavorited(!!fav)
      }
    }
    load()
  }, [id, user])

  const toggleFavorite = async () => {
    if (!user) return navigate('/login')
    if (isFavorited) {
      await supabase.from('patient_favorites').delete().eq('patient_id', user.id).eq('hospital_id', hospital.id)
    } else {
      await supabase.from('patient_favorites').insert({ patient_id: user.id, hospital_id: hospital.id })
    }
    setIsFavorited(!isFavorited)
  }

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Spinner size={40} color="var(--accent-primary)" />
      </div>
    </Layout>
  )

  if (!hospital) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Facility not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This facility may have been removed or the link is incorrect.</p>
        <Link to="/search"><Button variant="primary">Browse Facilities</Button></Link>
      </div>
    </Layout>
  )

  const services = hospital.hospital_services || []
  const hasService = (key) => services.some(s => s.service_type === key && s.is_available)
  const diagnosisServices = services.filter(s => ['newborn_screening', 'genetic_counseling', 'hemoglobin_electrophoresis'].includes(s.service_type))

  const defaultHours = {
    Monday: '08:00 AM - 05:00 PM',
    Tuesday: '08:00 AM - 05:00 PM',
    Wednesday: '08:00 AM - 05:00 PM',
    Thursday: '08:00 AM - 05:00 PM',
    Friday: '08:00 AM - 05:00 PM',
  }
  const hours = hospital.operating_hours || defaultHours

  return (
    <Layout>
      {/* Hero */}
      <div style={{ position: 'relative', height: '240px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', overflow: 'hidden' }}>
        {hospital.photo_url && (
          <img
            src={hospital.photo_url}
            alt={hospital.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
        }} />
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ paddingTop: '20px' }}>
            <Link to="/search" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'rgba(255,255,255,0.8)', fontSize: '13px', textDecoration: 'none',
            }}>
              <ChevronLeft size={15} /> Back to Search
            </Link>
          </div>
          <div style={{ paddingBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              {hospital.is_verified && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(37,99,235,0.8)', color: 'white',
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                  padding: '3px 10px', borderRadius: 'var(--radius-full)', marginBottom: '8px',
                }}>
                  PUBLIC HEALTH FACILITY
                </div>
              )}
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                {hospital.address}
              </p>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 800, color: 'white', lineHeight: 1.1,
              }}>
                {hospital.name}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {hospital.phone && (
                <a href={`tel:${hospital.phone}`}>
                  <Button variant="secondary" size="sm" icon={<Phone size={14} />}>
                    Call Now
                  </Button>
                </a>
              )}
              {hospital.latitude && (
                <a href={`https://www.google.com/maps?q=${hospital.latitude},${hospital.longitude}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="sm" icon={<MapPin size={14} />}>
                    Directions
                  </Button>
                </a>
              )}
              <button
                onClick={toggleFavorite}
                style={{
                  background: isFavorited ? '#fee2e2' : 'rgba(255,255,255,0.15)',
                  border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 10px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}
              >
                <Heart size={16} style={{ color: isFavorited ? 'var(--accent-emergency)' : 'white', fill: isFavorited ? 'var(--accent-emergency)' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px' }} className="facility-grid">

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Sickle Cell Services */}
            <Card>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🩸 Sickle Cell Services
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {SICKLE_CELL_SERVICES.map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle
                      size={16}
                      style={{ color: hasService(key) ? 'var(--accent-success)' : 'var(--border-strong)', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: '13px', color: hasService(key) ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Diagnosis & Lab */}
            {diagnosisServices.length > 0 && (
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>
                  🔬 Diagnosis & Lab Capabilities
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {diagnosisServices.map(s => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-tertiary)',
                    }}>
                      <CheckCircle size={16} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                          {s.service_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </p>
                        {s.description && (
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Specialist Staffing */}
            {specialists.length > 0 && (
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>
                  👨‍⚕️ Specialist Staffing & Clinics
                </h3>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>SPECIALIST ROLE</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>CLINIC SCHEDULE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specialists.map((s, i) => (
                        <tr key={s.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{s.role}</td>
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                            {s.clinic_schedule || 'Check with facility'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Operating Hours */}
            <Card>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--accent-primary)' }} /> Operating Hours
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DAYS.map(day => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{day}</span>
                    <span style={{ color: hours[day] ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: hours[day] ? 500 : 400 }}>
                      {hours[day] || 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
              {hospital.emergency_available && (
                <div style={{
                  marginTop: '12px', padding: '8px 12px',
                  background: '#fee2e2', borderRadius: 'var(--radius-md)',
                  fontSize: '12px', color: 'var(--accent-emergency)', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <AlertTriangle size={13} /> Emergency Services — 24 Hours / 7 Days
                </div>
              )}
            </Card>

            {/* Map */}
            {hospital.latitude && (
              <Card padding={false}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-primary)' }} /> Facility Location
                  </h3>
                </div>
                <FacilityMap
                  hospitals={[hospital]}
                  center={[hospital.latitude, hospital.longitude]}
                  zoom={14}
                  height="220px"
                />
                <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {hospital.address}
                </div>
              </Card>
            )}

            {/* Need Help CTA */}
            <Card style={{ background: 'var(--accent-primary)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
                Need Help?
              </h4>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginBottom: '14px', lineHeight: 1.6 }}>
                Contact the SCCL support team for questions regarding services at this facility.
              </p>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                icon={<Phone size={13} />}
                onClick={() => navigate('/emergency')}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .facility-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}