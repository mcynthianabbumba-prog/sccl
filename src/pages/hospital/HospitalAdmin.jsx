import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building, MapPin, Phone, Clock, Plus, Trash2, Save, CheckCircle, Activity, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Card, Button, Input, Textarea, Select, Badge, Alert, Spinner, Checkbox } from '../../components/ui'
import { Sun, Moon } from 'lucide-react'

const ALL_SERVICES = [
  'sickle_cell_testing', 'hydroxyurea_treatment', 'blood_transfusion',
  'pain_crisis_management', 'lab_services', 'newborn_screening',
  'genetic_counseling', 'hemoglobin_electrophoresis', 'pneumococcal_vaccines',
  'maternal_health', 'pediatrics', 'pharmacy', 'radiology', 'outpatient',
]

const SUB_COUNTIES = [
  'Mukono Town', 'Seeta', 'Goma', 'Ntenjeru', 'Buikwe', 'Lugazi',
  'Njeru', 'Katosi', 'Kayunga', 'Other',
]

export default function HospitalAdminPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [doctor, setDoctor] = useState(null)
  const [hospital, setHospital] = useState(null)
  const [services, setServices] = useState([])
  const [specialists, setSpecialists] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('details')
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return  // wait for auth to resolve
    if (!user) { navigate('/login'); return }
    async function load() {
      // Admins bypass the doctor requirement
      if (profile?.role === 'admin') {
        // Load first available hospital for admin, or show hospital selector
        const { data: hospitals } = await supabase
          .from('hospitals')
          .select('*, hospital_services(*), hospital_specialists(*)')
          .eq('is_active', true)
          .limit(1)
        if (hospitals?.[0]) {
          const h = hospitals[0]
          setDoctor({ id: 'admin', hospital: h })
          setHospital({
            id: h.id, name: h.name || '', slug: h.slug || '',
            description: h.description || '', address: h.address || '',
            sub_county: h.sub_county || '', phone: h.phone || '',
            email: h.email || '', website: h.website || '',
            latitude: h.latitude || '', longitude: h.longitude || '',
            emergency_available: h.emergency_available || false,
            is_active: h.is_active !== false,
          })
          setServices(h.hospital_services || [])
          setSpecialists(h.hospital_specialists || [])
        }
        setLoading(false)
        return
      }

      // Check if this user is an approved doctor
      const { data: doc } = await supabase
        .from('doctors')
        .select('*, hospital:hospitals(*, hospital_services(*), hospital_specialists(*))')
        .eq('profile_id', user.id)
        .eq('is_approved', true)
        .single()

      if (doc) {
        setDoctor(doc)
        const h = doc.hospital
        setHospital({
          id: h.id, name: h.name || '', slug: h.slug || '',
          description: h.description || '', address: h.address || '',
          sub_county: h.sub_county || '', phone: h.phone || '',
          email: h.email || '', website: h.website || '',
          latitude: h.latitude || '', longitude: h.longitude || '',
          emergency_available: h.emergency_available || false,
          is_active: h.is_active !== false,
        })
        setServices(h.hospital_services || [])
        setSpecialists(h.hospital_specialists || [])
      }
      setLoading(false)
    }
    load()
  }, [user, authLoading, profile])

  const saveHospital = async () => {
    if (!hospital) return
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('hospitals')
      .update({
        name: hospital.name, description: hospital.description,
        address: hospital.address, sub_county: hospital.sub_county,
        phone: hospital.phone, email: hospital.email, website: hospital.website,
        latitude: parseFloat(hospital.latitude) || null,
        longitude: parseFloat(hospital.longitude) || null,
        emergency_available: hospital.emergency_available,
        is_active: hospital.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hospital.id)

    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const toggleService = async (serviceType) => {
    const existing = services.find(s => s.service_type === serviceType)
    if (existing) {
      await supabase.from('hospital_services').delete().eq('id', existing.id)
      setServices(s => s.filter(x => x.service_type !== serviceType))
    } else {
      const { data } = await supabase
        .from('hospital_services')
        .insert({ hospital_id: hospital.id, service_type: serviceType, is_available: true })
        .select().single()
      if (data) setServices(s => [...s, data])
    }
  }

  const addSpecialist = async () => {
    const { data } = await supabase
      .from('hospital_specialists')
      .insert({ hospital_id: hospital.id, role: 'New Specialist', clinic_schedule: 'TBD' })
      .select().single()
    if (data) setSpecialists(s => [...s, data])
  }

  const updateSpecialist = (id, field, value) => {
    setSpecialists(ss => ss.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const saveSpecialist = async (specialist) => {
    await supabase.from('hospital_specialists')
      .update({ role: specialist.role, clinic_schedule: specialist.clinic_schedule })
      .eq('id', specialist.id)
  }

  const removeSpecialist = async (id) => {
    await supabase.from('hospital_specialists').delete().eq('id', id)
    setSpecialists(ss => ss.filter(s => s.id !== id))
  }

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <Spinner size={40} color="var(--accent-primary)" />
    </div>
  )

  if (!doctor) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          This portal is for approved hospital administrators only. Please sign in with your hospital account or contact SCCL support for access.
        </p>
        <Button variant="primary" onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    </div>
  )

  const tabs = [
    { id: 'details', label: '🏥 Facility Details' },
    { id: 'services', label: '🩺 Services' },
    { id: 'specialists', label: '👨‍⚕️ Specialists' },
    { id: 'hours', label: '🕐 Hours' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top bar */}
      <header style={{
        height: 'var(--nav-height)', background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px' }}>SCCL</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/ Hospital Portal</span>
        </div>
        <div style={{ flex: 1 }} />
        {hospital?.name && (
          <Badge variant="verified">{hospital.name}</Badge>
        )}
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={() => { signOut(); navigate('/') }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          <LogOut size={15} /> Sign Out
        </button>
      </header>

      <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
            Hospital Administration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage your facility's information, services, and specialist schedules.
          </p>
        </div>

        {saved && <Alert type="success" style={{ marginBottom: '20px' }}>Changes saved successfully.</Alert>}
        {error && <Alert type="error" onClose={() => setError('')} style={{ marginBottom: '20px' }}>{error}</Alert>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${tab === t.id ? 'var(--accent-primary)' : 'transparent'}`,
                marginBottom: '-1px', fontFamily: 'var(--font-body)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Details */}
        {tab === 'details' && hospital && (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} style={{ color: 'var(--accent-primary)' }} /> Facility Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-2col">
                <Input label="Facility Name" value={hospital.name} onChange={e => setHospital(h => ({ ...h, name: e.target.value }))} />
                <Input label="Phone Number" value={hospital.phone} onChange={e => setHospital(h => ({ ...h, phone: e.target.value }))} icon={<Phone size={14} />} />
              </div>
              <Textarea label="Description" value={hospital.description} onChange={e => setHospital(h => ({ ...h, description: e.target.value }))} rows={3} />
              <Input label="Full Address" value={hospital.address} onChange={e => setHospital(h => ({ ...h, address: e.target.value }))} icon={<MapPin size={14} />} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-2col">
                <Select label="Sub-County" value={hospital.sub_county} onChange={e => setHospital(h => ({ ...h, sub_county: e.target.value }))}>
                  <option value="">Select sub-county...</option>
                  {SUB_COUNTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Email" type="email" value={hospital.email} onChange={e => setHospital(h => ({ ...h, email: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-2col">
                <Input label="Latitude" type="number" step="0.0001" value={hospital.latitude} onChange={e => setHospital(h => ({ ...h, latitude: e.target.value }))} placeholder="e.g. 0.3532" />
                <Input label="Longitude" type="number" step="0.0001" value={hospital.longitude} onChange={e => setHospital(h => ({ ...h, longitude: e.target.value }))} placeholder="e.g. 32.7559" />
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <Checkbox
                  label="24/7 Emergency Available"
                  checked={hospital.emergency_available}
                  onChange={e => setHospital(h => ({ ...h, emergency_available: e.target.checked }))}
                />
                <Checkbox
                  label="Facility Active / Visible"
                  checked={hospital.is_active}
                  onChange={e => setHospital(h => ({ ...h, is_active: e.target.checked }))}
                />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" icon={<Save size={14} />} loading={saving} onClick={saveHospital}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Tab: Services */}
        {tab === 'services' && (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
              Available Services
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Toggle which services your facility provides. These appear on your public profile.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
              {ALL_SERVICES.map(service => {
                const active = services.some(s => s.service_type === service)
                return (
                  <div
                    key={service}
                    onClick={() => toggleService(service)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: active ? 'var(--blue-50)' : 'transparent',
                      cursor: 'pointer', transition: 'all var(--transition-fast)',
                    }}
                  >
                    <CheckCircle
                      size={18}
                      style={{ color: active ? 'var(--accent-primary)' : 'var(--border-strong)', flexShrink: 0 }}
                    />
                    <span style={{
                      fontSize: '13px', fontWeight: active ? 600 : 500,
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      textTransform: 'capitalize',
                    }}>
                      {service.replace(/_/g, ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
              Changes are saved immediately when you click a service.
            </p>
          </Card>
        )}

        {/* Tab: Specialists */}
        {tab === 'specialists' && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>
                Specialist Staff & Clinics
              </h3>
              <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={addSpecialist}>
                Add Specialist
              </Button>
            </div>
            {specialists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍⚕️</div>
                <p>No specialists added yet. Click "Add Specialist" to begin.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {specialists.map(s => (
                  <div key={s.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                    gap: '12px', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)',
                  }}>
                    <Input
                      value={s.role}
                      onChange={e => updateSpecialist(s.id, 'role', e.target.value)}
                      placeholder="e.g. Lead Hematologist"
                    />
                    <Input
                      value={s.clinic_schedule || ''}
                      onChange={e => updateSpecialist(s.id, 'clinic_schedule', e.target.value)}
                      placeholder="e.g. Tuesdays & Thursdays"
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button variant="success" size="sm" icon={<Save size={13} />} onClick={() => saveSpecialist(s)} />
                      <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => removeSpecialist(s.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tab: Hours */}
        {tab === 'hours' && (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
              Operating Hours
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Set your facility's opening and closing hours for each day.
            </p>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} style={{
                display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px',
                padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
              }}>
                <span style={{ width: '100px', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>{day}</span>
                <input type="time" defaultValue="08:00" style={{
                  padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>to</span>
                <input type="time" defaultValue={['Saturday', 'Sunday'].includes(day) ? '13:00' : '17:00'} style={{
                  padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <input type="checkbox" defaultChecked={!['Saturday', 'Sunday'].includes(day)} style={{ accentColor: 'var(--accent-primary)' }} />
                  Open
                </label>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" icon={<Save size={14} />} onClick={saveHospital} loading={saving}>
                Save Hours
              </Button>
            </div>
          </Card>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
