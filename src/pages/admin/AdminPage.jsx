import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building, Users, Phone, Activity,
  Plus, Pencil, Trash2, Search, Sun, Moon, LogOut, Eye, UserPlus
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  Card, Button, Badge, Input, Textarea, Select,
  Modal, Alert, Spinner, StatCard, Checkbox
} from '../../components/ui'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@sccl.ug'

const SUB_COUNTIES = [
  'Mukono Town', 'Seeta', 'Goma', 'Ntenjeru', 'Buikwe',
  'Lugazi', 'Njeru', 'Katosi', 'Kayunga', 'Other',
]

const emptyForm = {
  name: '', description: '', address: '', sub_county: '',
  phone: '', email: '', website: '', latitude: '', longitude: '',
  emergency_available: false, is_verified: false, is_active: true,
  doctorName: '', doctorEmail: '', doctorPassword: '',
}

// ─────────────────────────────────────────────────────────────
// Creates a doctor Supabase auth account + profile + doctors row
// while preserving the admin session.
//
// The problem: supabase.auth.signUp() replaces the active session,
// logging the admin out. Fix: capture tokens → signUp → write DB
// records while doctor session is active → restore admin session.
// ─────────────────────────────────────────────────────────────
async function createDoctorAccount({ email, password, fullName, hospitalId }) {
  // 1. Snapshot admin session tokens before they get replaced
  const { data: { session } } = await supabase.auth.getSession()
  const savedAccess  = session?.access_token
  const savedRefresh = session?.refresh_token

  const restore = async () => {
    if (savedAccess && savedRefresh) {
      await supabase.auth.setSession({
        access_token: savedAccess,
        refresh_token: savedRefresh,
      })
    }
  }

  // 2. Create the doctor's auth account (session now belongs to doctor)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || email, role: 'doctor' } },
  })

  if (error) {
    await restore()
    // If email already exists just link them to the hospital
    if (error.message.toLowerCase().includes('already registered')) {
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('email', email).maybeSingle()
      if (existing?.id) {
        await supabase.from('profiles')
          .update({ role: 'doctor' }).eq('id', existing.id)
        await supabase.from('doctors').upsert(
          { profile_id: existing.id, hospital_id: hospitalId, is_approved: true },
          { onConflict: 'profile_id' }
        )
      }
      return null // not an error — user already existed, now linked
    }
    return error.message
  }

  const uid = data?.user?.id
  if (!uid) { await restore(); return 'Could not get new user ID.' }

  // 3. We are now the doctor — write profile + doctors row
  //    RLS allows a user to upsert their own profile row
  const { error: pErr } = await supabase.from('profiles').upsert(
    { id: uid, email, full_name: fullName || email, role: 'doctor' },
    { onConflict: 'id' }
  )
  if (pErr) { await restore(); return pErr.message }

  const { error: dErr } = await supabase.from('doctors').upsert(
    { profile_id: uid, hospital_id: hospitalId, is_approved: true },
    { onConflict: 'profile_id' }
  )
  if (dErr) { await restore(); return dErr.message }

  // 4. Restore admin session
  await restore()
  return null // success
}

// ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [hospitals, setHospitals]   = useState([])
  const [doctors,   setDoctors]     = useState([])
  const [contacts,  setContacts]    = useState([])
  const [stats,     setStats]       = useState({ hospitals: 0, doctors: 0, emergency: 0 })
  const [loading,   setLoading]     = useState(true)
  const [tab,       setTab]         = useState('hospitals')
  const [searchQ,   setSearchQ]     = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editForm,  setEditForm]    = useState(emptyForm)
  const [editId,    setEditId]      = useState(null)
  const [saving,    setSaving]      = useState(false)
  const [delTarget, setDelTarget]   = useState(null)
  const [alert,     setAlert]       = useState(null)
  const navigate = useNavigate()

  const isAdmin = profile?.role === 'admin' || user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (isAdmin) loadAll()
  }, [user, isAdmin])

  async function loadAll() {
    setLoading(true)
    const [hRes, dRes, eRes] = await Promise.all([
      supabase.from('hospitals').select('*, hospital_services(*)').order('name'),
      supabase.from('doctors')
        .select('*, profile:profiles(full_name, email), hospital:hospitals(name)')
        .order('created_at', { ascending: false }),
      supabase.from('emergency_contacts').select('*').order('sort_order'),
    ])
    setHospitals(hRes.data || [])
    setDoctors(dRes.data   || [])
    setContacts(eRes.data  || [])
    const em = (hRes.data || []).filter(h => h.emergency_available).length
    setStats({ hospitals: hRes.data?.length || 0, doctors: dRes.data?.length || 0, emergency: em })
    setLoading(false)
  }

  const set = (field) => (e) =>
    setEditForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const openCreate = () => { setEditForm(emptyForm); setEditId(null); setModalOpen(true) }

  const openEdit = (h) => {
    const linked = doctors.find(d => d.hospital_id === h.id)
    setEditForm({
      name: h.name || '', description: h.description || '',
      address: h.address || '', sub_county: h.sub_county || '',
      phone: h.phone || '', email: h.email || '', website: h.website || '',
      latitude: h.latitude || '', longitude: h.longitude || '',
      emergency_available: h.emergency_available || false,
      is_verified: h.is_verified || false,
      is_active: h.is_active !== false,
      doctorName:     linked?.profile?.full_name || '',
      doctorEmail:    linked?.profile?.email     || '',
      doctorPassword: '',
    })
    setEditId(h.id)
    setModalOpen(true)
  }

  const saveHospital = async () => {
    if (!editForm.name.trim()) {
      setAlert({ type: 'error', msg: 'Hospital name is required.' }); return
    }
    if (!editId && !editForm.doctorEmail.trim()) {
      setAlert({ type: 'error', msg: 'Doctor email is required when creating a hospital.' }); return
    }
    if (!editId && editForm.doctorPassword.length < 6) {
      setAlert({ type: 'error', msg: 'Doctor password must be at least 6 characters.' }); return
    }

    setSaving(true); setAlert(null)

    const payload = {
      name: editForm.name, description: editForm.description,
      address: editForm.address, sub_county: editForm.sub_county,
      phone: editForm.phone, email: editForm.email, website: editForm.website,
      latitude:  parseFloat(editForm.latitude)  || null,
      longitude: parseFloat(editForm.longitude) || null,
      emergency_available: editForm.emergency_available,
      is_verified: editForm.is_verified,
      is_active:   editForm.is_active,
      slug: editForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      updated_at: new Date().toISOString(),
    }

    let hospitalId = editId

    if (editId) {
      const { error } = await supabase.from('hospitals').update(payload).eq('id', editId)
      if (error) { setAlert({ type: 'error', msg: error.message }); setSaving(false); return }

      // Only create/update doctor if new credentials were supplied
      if (editForm.doctorEmail.trim() && editForm.doctorPassword.length >= 6) {
        const err = await createDoctorAccount({
          email: editForm.doctorEmail.trim(),
          password: editForm.doctorPassword,
          fullName: editForm.doctorName,
          hospitalId: editId,
        })
        if (err) {
          setAlert({ type: 'error', msg: 'Hospital saved. Doctor account failed: ' + err })
          setSaving(false); loadAll(); setModalOpen(false); return
        }
      }
    } else {
      const { data: newH, error: hErr } = await supabase
        .from('hospitals').insert(payload).select('id').single()
      if (hErr) { setAlert({ type: 'error', msg: hErr.message }); setSaving(false); return }
      hospitalId = newH.id

      const err = await createDoctorAccount({
        email:      editForm.doctorEmail.trim(),
        password:   editForm.doctorPassword,
        fullName:   editForm.doctorName,
        hospitalId,
      })
      if (err) {
        setAlert({ type: 'error', msg: `Hospital created but doctor account failed: ${err}` })
        setSaving(false); loadAll(); setModalOpen(false); return
      }
    }

    setSaving(false); setModalOpen(false); loadAll()
    setAlert({ type: 'success', msg: `Hospital ${editId ? 'updated' : 'created'} successfully.` })
    setTimeout(() => setAlert(null), 5000)
  }

  const deleteHospital = async (id) => {
    await supabase.from('hospitals').delete().eq('id', id)
    setDelTarget(null); loadAll()
    setAlert({ type: 'success', msg: 'Hospital deleted.' })
    setTimeout(() => setAlert(null), 3000)
  }

  const filtered = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    (h.sub_county || '').toLowerCase().includes(searchQ.toLowerCase())
  )

  // ── Guards ────────────────────────────────────────────────
  if (authLoading || (user && !profile)) return (
    <Centered><Spinner size={40} color="var(--accent-primary)" /></Centered>
  )
  if (!isAdmin) return (
    <Centered>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
          Admin Access Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          This page is restricted to SCCL administrators.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </Centered>
  )

  const NavBtn = ({ id, label, icon: Icon }) => (
    <button onClick={() => setTab(id)} style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '9px 14px', borderRadius: 'var(--radius-md)',
      background: tab === id ? 'var(--blue-50)' : 'transparent',
      border: 'none', cursor: 'pointer',
      color: tab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
      fontWeight: tab === id ? 700 : 500, fontSize: '13px',
      fontFamily: 'var(--font-body)',
      borderLeft: `3px solid ${tab === id ? 'var(--accent-primary)' : 'transparent'}`,
    }}>
      <Icon size={15} /> {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)', display: 'flex',
        flexDirection: 'column', position: 'fixed', height: '100vh',
      }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px' }}>SCCL Admin</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>SITE OWNER</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <NavBtn id="hospitals" label="Hospitals"          icon={Building}       />
          <NavBtn id="doctors"   label="Doctors"            icon={Users}          />
          <NavBtn id="emergency" label="Emergency Contacts" icon={Phone}          />
          <NavBtn id="overview"  label="Overview"           icon={LayoutDashboard}/>
        </nav>
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '13px' }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Administrator</p>
          </div>
          <button onClick={() => { signOut(); navigate('/') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: '220px' }}>
        <header style={{
          height: 'var(--nav-height)', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', flex: 1 }}>
            {tab === 'hospitals' && '🏥 Hospital Management'}
            {tab === 'doctors'   && '👨‍⚕️ Doctor Accounts'}
            {tab === 'emergency' && '🚨 Emergency Contacts'}
            {tab === 'overview'  && '📊 Platform Overview'}
          </span>
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <main style={{ padding: 'clamp(16px, 3vw, 28px) clamp(14px, 3vw, 24px)' }}>
          {alert && (
            <Alert type={alert.type} onClose={() => setAlert(null)} style={{ marginBottom: '20px' }}>
              {alert.msg}
            </Alert>
          )}

          {/* Overview */}
          {tab === 'overview' && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
                <StatCard icon={<Building size={22}/>} label="Total Hospitals"  value={stats.hospitals} color="blue"  />
                <StatCard icon={<Users    size={22}/>} label="Doctor Accounts"  value={stats.doctors}   color="green" />
                <StatCard icon={<Phone    size={22}/>} label="Emergency Units"  value={stats.emergency} color="red"   />
              </div>
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>Platform Health</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {hospitals.filter(h => h.is_verified).length} verified · {hospitals.filter(h => h.is_active).length} active · {hospitals.filter(h => !h.is_active).length} inactive
                </p>
              </Card>
            </div>
          )}

          {/* Hospitals */}
          {tab === 'hospitals' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '360px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
                  <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search hospitals..."
                    style={{ border: 'none', background: 'none', outline: 'none', padding: '9px 0', fontSize: '13px', fontFamily: 'var(--font-body)', flex: 1, color: 'var(--text-primary)' }} />
                </div>
                <Button variant="primary" icon={<Plus size={14}/>} onClick={openCreate}>Add Hospital</Button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner size={32} color="var(--accent-primary)" /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filtered.map(h => {
                    const linked = doctors.find(d => d.hospital_id === h.id)
                    return (
                      <div key={h.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>{h.name}</span>
                            {h.is_verified         && <Badge variant="verified">Verified</Badge>}
                            {h.emergency_available && <Badge variant="danger">Emergency</Badge>}
                            {!h.is_active          && <Badge variant="warning">Inactive</Badge>}
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {h.sub_county} · {h.phone || 'No phone'} · {h.hospital_services?.length || 0} services
                            {linked && <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}> · 👨‍⚕️ {linked.profile?.email}</span>}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button variant="ghost"   size="sm" icon={<Eye     size={13}/>} onClick={() => window.open(`/facility/${h.slug || h.id}`, '_blank')} />
                          <Button variant="outline" size="sm" icon={<Pencil  size={13}/>} onClick={() => openEdit(h)}>Edit</Button>
                          <Button variant="danger"  size="sm" icon={<Trash2  size={13}/>} onClick={() => setDelTarget(h)}>Delete</Button>
                        </div>
                      </div>
                    )
                  })}
                  {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No hospitals found{searchQ ? ` matching "${searchQ}"` : ''}.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Doctors */}
          {tab === 'doctors' && (
            <div className="animate-fade-in">
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Doctor accounts are created when you add a hospital. Each hospital has one linked doctor who logs in at <code style={{ background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: '4px' }}>/doctor</code>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner size={32} color="var(--accent-primary)" /></div>
                ) : doctors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍⚕️</div>
                    <p>No doctor accounts yet. Add a hospital to create one.</p>
                  </div>
                ) : doctors.map(doc => (
                  <div key={doc.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                      {(doc.profile?.full_name || doc.profile?.email || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px' }}>{doc.profile?.full_name || 'Unnamed'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.profile?.email} · {doc.hospital?.name || 'No hospital'}</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency */}
          {tab === 'emergency' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contacts.map(c => (
                <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>{c.name}</span>
                      <Badge variant={c.category === 'ambulance' ? 'danger' : c.category === 'scd_hotline' ? 'primary' : 'success'}>
                        {c.category.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.description} · {c.phone}</p>
                  </div>
                  <Button variant="outline" size="sm" icon={<Pencil size={13}/>}>Edit</Button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Hospital Create / Edit Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Hospital' : 'Add Hospital'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Hospital Name *"  value={editForm.name}  onChange={set('name')}  placeholder="e.g. Mukono General Hospital" />
            <Input label="Phone"            value={editForm.phone} onChange={set('phone')} placeholder="+256 700 000 000" />
          </div>
          <Textarea label="Description" value={editForm.description} onChange={set('description')} rows={2} />
          <Input label="Full Address" value={editForm.address} onChange={set('address')} placeholder="Plot 42, Kampala-Jinja Road" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select label="Sub-County" value={editForm.sub_county} onChange={set('sub_county')}>
              <option value="">Select...</option>
              {SUB_COUNTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input label="Hospital Email" type="email" value={editForm.email} onChange={set('email')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Latitude"  type="number" step="0.0001" value={editForm.latitude}  onChange={set('latitude')}  placeholder="e.g. 0.3532"  />
            <Input label="Longitude" type="number" step="0.0001" value={editForm.longitude} onChange={set('longitude')} placeholder="e.g. 32.7559" />
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <Checkbox label="Verified"         checked={editForm.is_verified}         onChange={set('is_verified')}         />
            <Checkbox label="24/7 Emergency"   checked={editForm.emergency_available} onChange={set('emergency_available')} />
            <Checkbox label="Active / Visible" checked={editForm.is_active}           onChange={set('is_active')}           />
          </div>

          {/* Doctor section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <UserPlus size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>Doctor Account</span>
              {editId && editForm.doctorEmail && <Badge variant="success">Linked</Badge>}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {editId
                ? "The doctor logs in at /doctor to manage services, specialists & hours. Leave password blank to keep the existing one."
                : "This doctor will manage the hospital's services, specialists, and operating hours at /doctor."}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Input label="Doctor's Full Name" value={editForm.doctorName} onChange={set('doctorName')} placeholder="e.g. Dr. Jane Smith" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label={`Doctor Email${editId ? '' : ' *'}`} type="email" value={editForm.doctorEmail} onChange={set('doctorEmail')} placeholder="doctor@hospital.ug" />
                <Input label={editId ? 'New Password (optional)' : 'Password *'} type="password" value={editForm.doctorPassword} onChange={set('doctorPassword')} placeholder={editId ? 'Leave blank to keep existing' : 'Min. 6 characters'} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={saveHospital}>
              {editId ? 'Save Changes' : 'Create Hospital'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal isOpen={!!delTarget} onClose={() => setDelTarget(null)} title="Delete Hospital" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to delete <strong>{delTarget?.name}</strong>? All associated services and specialist records will also be removed. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDelTarget(null)}>Cancel</Button>
          <Button variant="danger" icon={<Trash2 size={14}/>} onClick={() => deleteHospital(delTarget.id)}>
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function Centered({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '24px' }}>
      {children}
    </div>
  )
}
