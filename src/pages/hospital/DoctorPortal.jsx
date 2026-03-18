import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building, MapPin, Phone, Clock, Plus, Trash2,
  Save, CheckCircle, Activity, LogOut, Sun, Moon
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  Card, Button, Input, Textarea, Select,
  Alert, Spinner, Checkbox
} from '../../components/ui'

const ALL_SERVICES = [
  'sickle_cell_testing', 'hydroxyurea_treatment', 'blood_transfusion',
  'pain_crisis_management', 'lab_services', 'newborn_screening',
  'genetic_counseling', 'hemoglobin_electrophoresis', 'pneumococcal_vaccines',
  'maternal_health', 'pediatrics', 'pharmacy', 'radiology', 'outpatient',
]

const SUB_COUNTIES = [
  'Mukono Town', 'Seeta', 'Goma', 'Ntenjeru', 'Buikwe',
  'Lugazi', 'Njeru', 'Katosi', 'Kayunga', 'Other',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DoctorPortal() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [hospital, setHospital] = useState(null)
  const [hospitalForm, setHospitalForm] = useState(null)
  const [services, setServices] = useState([])
  const [specialists, setSpecialists] = useState([])
  const [hours, setHours] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('details')
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    load()
  }, [user, authLoading, profile])

  async function load() {
    setLoading(true)

    // Find the hospital linked to this doctor account
    const { data: doc } = await supabase
      .from('doctors')
      .select('hospital_id')
      .eq('profile_id', user.id)
      .single()

    if (!doc?.hospital_id) { setLoading(false); return }

    const { data: h } = await supabase
      .from('hospitals')
      .select('*, hospital_services(*), hospital_specialists(*)')
      .eq('id', doc.hospital_id)
      .single()

    if (h) {
      setHospital(h)
      setHospitalForm({
        name: h.name || '', description: h.description || '',
        address: h.address || '', sub_county: h.sub_county || '',
        phone: h.phone || '', email: h.email || '', website: h.website || '',
        latitude: h.latitude || '', longitude: h.longitude || '',
        emergency_available: h.emergency_available || false,
        is_active: h.is_active !== false,
      })
      setServices(h.hospital_services || [])
      setSpecialists(h.hospital_specialists || [])
      setHours(h.operating_hours || {
        Monday: { open: '08:00', close: '17:00', closed: false },
        Tuesday: { open: '08:00', close: '17:00', closed: false },
        Wednesday: { open: '08:00', close: '17:00', closed: false },
        Thursday: { open: '08:00', close: '17:00', closed: false },
        Friday: { open: '08:00', close: '17:00', closed: false },
        Saturday: { open: '08:00', close: '13:00', closed: true },
        Sunday: { open: '08:00', close: '13:00', closed: true },
      })
    }
    setLoading(false)
  }

  const saveDetails = async () => {
    setSaving(true); setError('')
    const { error } = await supabase
      .from('hospitals')
      .update({
        ...hospitalForm,
        latitude: parseFloat(hospitalForm.latitude) || null,
        longitude: parseFloat(hospitalForm.longitude) || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hospital.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setSaved(true); setTimeout(() => setSaved(false), 3000)
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
      .insert({ hospital_id: hospital.id, role: '', clinic_schedule: '' })
      .select().single()
    if (data) setSpecialists(s => [...s, data])
  }

  const updateSpecialist = (id, field, value) =>
    setSpecialists(ss => ss.map(s => s.id === id ? { ...s, [field]: value } : s))

  const saveSpecialist = async (sp) => {
    await supabase.from('hospital_specialists')
      .update({ role: sp.role, clinic_schedule: sp.clinic_schedule })
      .eq('id', sp.id)
  }

  const removeSpecialist = async (id) => {
    await supabase.from('hospital_specialists').delete().eq('id', id)
    setSpecialists(ss => ss.filter(s => s.id !== id))
  }

  const saveHours = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('hospitals')
      .update({ operating_hours: hours, updated_at: new Date().toISOString() })
      .eq('id', hospital.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  const updateHour = (day, field, value) =>
    setHours(h => ({ ...h, [day]: { ...h[day], [field]: value } }))

  // --- Render states ---
  if (authLoading || (user && !profile)) return <FullSpinner />

  if (!loading && !hospital) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No hospital linked</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Your account hasn't been linked to a hospital yet. Please contact the SCCL administrator.
        </p>
        <Button variant="outline" onClick={() => { signOut(); navigate('/') }}>Sign Out</Button>
      </div>
    </div>
  )

  if (loading) return <FullSpinner />

  const tabs = [
    { id: 'details', label: '🏥 Details' },
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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>SCCL</span>
        </Link>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />

        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {hospital?.name}
        </span>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{profile?.full_name || user?.email}</span>

        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={() => { signOut(); navigate('/') }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', padding: '6px 12px',
            cursor: 'pointer', color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', fontSize: '13px',
          }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
            Manage Your Facility
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Update services, specialists, and operating hours for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{hospital?.name}</strong>.
          </p>
        </div>

        {saved && <Alert type="success" style={{ marginBottom: '20px' }}>Changes saved successfully.</Alert>}
        {error && <Alert type="error" onClose={() => setError('')} style={{ marginBottom: '20px' }}>{error}</Alert>}

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '2px', marginBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '13px',
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${tab === t.id ? 'var(--accent-primary)' : 'transparent'}`,
                marginBottom: '-1px', fontFamily: 'var(--font-body)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Details Tab ── */}
        {tab === 'details' && hospitalForm && (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} style={{ color: 'var(--accent-primary)' }} /> Facility Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-2col">
                <Input label="Facility Name" value={hospitalForm.name} onChange={e => setHospitalForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="Phone Number" value={hospitalForm.phone} onChange={e => setHospitalForm(f => ({ ...f, phone: e.target.value }))} icon={<Phone size={14} />} />
              </div>
              <Textarea label="Description" value={hospitalForm.description} onChange={e => setHospitalForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              <Input label="Full Address" value={hospitalForm.address} onChange={e => setHospitalForm(f => ({ ...f, address: e.target.value }))} icon={<MapPin size={14} />} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-2col">
                <Select label="Sub-County" value={hospitalForm.sub_county} onChange={e => setHospitalForm(f => ({ ...f, sub_county: e.target.value }))}>
                  <option value="">Select sub-county...</option>
                  {SUB_COUNTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Email" type="email" value={hospitalForm.email} onChange={e => setHospitalForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-2col">
                <Input label="Latitude" type="number" step="0.0001" value={hospitalForm.latitude} onChange={e => setHospitalForm(f => ({ ...f, latitude: e.target.value }))} placeholder="e.g. 0.3532" />
                <Input label="Longitude" type="number" step="0.0001" value={hospitalForm.longitude} onChange={e => setHospitalForm(f => ({ ...f, longitude: e.target.value }))} placeholder="e.g. 32.7559" />
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <Checkbox label="24/7 Emergency Available" checked={hospitalForm.emergency_available} onChange={e => setHospitalForm(f => ({ ...f, emergency_available: e.target.checked }))} />
                <Checkbox label="Facility Active / Visible on site" checked={hospitalForm.is_active} onChange={e => setHospitalForm(f => ({ ...f, is_active: e.target.checked }))} />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" icon={<Save size={14} />} loading={saving} onClick={saveDetails}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* ── Services Tab ── */}
        {tab === 'services' && (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
              Available Services
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Toggle which services your facility provides. Changes save immediately.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {ALL_SERVICES.map(serviceType => {
                const active = services.some(s => s.service_type === serviceType)
                return (
                  <div
                    key={serviceType}
                    onClick={() => toggleService(serviceType)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: active ? 'var(--blue-50)' : 'transparent',
                      cursor: 'pointer', transition: 'all var(--transition-fast)',
                      userSelect: 'none',
                    }}
                  >
                    <CheckCircle
                      size={17}
                      style={{ color: active ? 'var(--accent-primary)' : 'var(--border-strong)', flexShrink: 0 }}
                    />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      textTransform: 'capitalize',
                    }}>
                      {serviceType.replace(/_/g, ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* ── Specialists Tab ── */}
        {tab === 'specialists' && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>
                  Specialist Staff & Clinics
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Add specialist roles and their clinic schedules.
                </p>
              </div>
              <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={addSpecialist}>
                Add Specialist
              </Button>
            </div>

            {specialists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>👨‍⚕️</div>
                <p style={{ fontSize: '14px' }}>No specialists added yet.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "Add Specialist" to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {specialists.map(sp => (
                  <div key={sp.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                    gap: '12px', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                  }} className="specialist-row">
                    <Input
                      value={sp.role}
                      onChange={e => updateSpecialist(sp.id, 'role', e.target.value)}
                      placeholder="e.g. Lead Hematologist"
                    />
                    <Input
                      value={sp.clinic_schedule || ''}
                      onChange={e => updateSpecialist(sp.id, 'clinic_schedule', e.target.value)}
                      placeholder="e.g. Tuesdays & Thursdays"
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button variant="success" size="sm" icon={<Save size={13} />} onClick={() => saveSpecialist(sp)} />
                      <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => removeSpecialist(sp.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ── Hours Tab ── */}
        {tab === 'hours' && (
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
              Operating Hours
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Set your opening and closing times for each day.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DAYS.map(day => {
                const d = hours[day] || { open: '08:00', close: '17:00', closed: false }
                return (
                  <div key={day} style={{
                    display: 'grid', gridTemplateColumns: '100px 1fr 1fr auto',
                    gap: '12px', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: d.closed ? 'var(--bg-tertiary)' : 'transparent',
                    opacity: d.closed ? 0.6 : 1,
                  }} className="hours-row">
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{day}</span>
                    <input
                      type="time" value={d.open} disabled={d.closed}
                      onChange={e => updateHour(day, 'open', e.target.value)}
                      style={timeInputStyle}
                    />
                    <input
                      type="time" value={d.close} disabled={d.closed}
                      onChange={e => updateHour(day, 'close', e.target.value)}
                      style={timeInputStyle}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={d.closed}
                        onChange={e => updateHour(day, 'closed', e.target.checked)}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      Closed
                    </label>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" icon={<Save size={14} />} loading={saving} onClick={saveHours}>
                Save Hours
              </Button>
            </div>
          </Card>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-2col { grid-template-columns: 1fr !important; }
          .specialist-row { grid-template-columns: 1fr !important; }
          .hours-row { grid-template-columns: 80px 1fr 1fr !important; }
          .hours-row label { grid-column: 1 / -1; }
        }
      `}</style>
    </div>
  )
}

const timeInputStyle = {
  padding: '8px 10px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
  color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '13px',
  width: '100%',
}

function FullSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <Spinner size={40} color="var(--accent-primary)" />
    </div>
  )
}
