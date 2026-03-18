import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building, Phone, Activity,
  Plus, Pencil, Trash2, Search, Sun, Moon, LogOut, Eye, UserPlus
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  Card, Button, Badge, Input, Textarea, Select,
  Modal, Alert, Spinner, StatCard, Checkbox
} from '../../components/ui'

const SUB_COUNTIES = [
  'Mukono Town', 'Seeta', 'Goma', 'Ntenjeru', 'Buikwe',
  'Lugazi', 'Njeru', 'Katosi', 'Kayunga', 'Other',
]

const emptyForm = {
  name: '', description: '', address: '', sub_county: '',
  phone: '', email: '', website: '', latitude: '', longitude: '',
  emergency_available: false, is_verified: false, is_active: true,
  doctorEmail: '', doctorPassword: '', doctorName: '',
}

export default function AdminPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [hospitals, setHospitals] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [stats, setStats] = useState({ hospitals: 0, emergency: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('hospitals')
  const [searchQ, setSearchQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [alert, setAlert] = useState(null)
  const navigate = useNavigate()

  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    if (isAdmin) loadAll()
  }, [user, authLoading, isAdmin])

  async function loadAll() {
    setLoading(true)
    const [hospRes, emRes] = await Promise.all([
      supabase.from('hospitals').select('*, hospital_services(*)').order('name'),
      supabase.from('emergency_contacts').select('*').order('sort_order'),
    ])
    setHospitals(hospRes.data || [])
    setEmergencyContacts(emRes.data || [])
    const emergency = (hospRes.data || []).filter(h => h.emergency_available).length
    setStats({ hospitals: hospRes.data?.length || 0, emergency })
    setLoading(false)
  }

  const openCreate = () => { setEditForm(emptyForm); setEditId(null); setModalOpen(true) }

  const openEdit = (h) => {
    setEditForm({
      name: h.name || '', description: h.description || '',
      address: h.address || '', sub_county: h.sub_county || '',
      phone: h.phone || '', email: h.email || '', website: h.website || '',
      latitude: h.latitude || '', longitude: h.longitude || '',
      emergency_available: h.emergency_available || false,
      is_verified: h.is_verified || false,
      is_active: h.is_active !== false,
      doctorEmail: '', doctorPassword: '', doctorName: '',
    })
    setEditId(h.id)
    setModalOpen(true)
  }

  const set = (field) => (e) =>
    setEditForm(f => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function createDoctorAccount(hospitalId, form) {
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.doctorEmail,
      password: form.doctorPassword,
      options: { data: { full_name: form.doctorName || form.doctorEmail, role: 'doctor' } },
    })
    if (signUpErr) return signUpErr.message

    const uid = data?.user?.id
    if (!uid) return 'Could not retrieve new user ID.'

    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: uid, email: form.doctorEmail,
      full_name: form.doctorName || form.doctorEmail,
      role: 'doctor', updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    if (profileErr) return profileErr.message

    const { error: doctorErr } = await supabase.from('doctors').upsert({
      profile_id: uid, hospital_id: hospitalId,
      is_approved: true, updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' })
    if (doctorErr) return doctorErr.message

    return null
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
      latitude: parseFloat(editForm.latitude) || null,
      longitude: parseFloat(editForm.longitude) || null,
      emergency_available: editForm.emergency_available,
      is_verified: editForm.is_verified, is_active: editForm.is_active,
      slug: editForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      updated_at: new Date().toISOString(),
    }

    let hospitalId = editId

    if (editId) {
      const { error } = await supabase.from('hospitals').update(payload).eq('id', editId)
      if (error) { setAlert({ type: 'error', msg: error.message }); setSaving(false); return }
      // Create new doctor only if credentials were provided
      if (editForm.doctorEmail.trim() && editForm.doctorPassword.length >= 6) {
        const err = await createDoctorAccount(editId, editForm)
        if (err) { setAlert({ type: 'error', msg: 'Hospital saved. Doctor account failed: ' + err }); setSaving(false); loadAll(); setModalOpen(false); return }
      }
    } else {
      const { data: newH, error: hospErr } = await supabase.from('hospitals').insert(payload).select('id').single()
      if (hospErr) { setAlert({ type: 'error', msg: hospErr.message }); setSaving(false); return }
      hospitalId = newH.id
      const err = await createDoctorAccount(hospitalId, editForm)
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
    setDeleteConfirm(null); loadAll()
    setAlert({ type: 'success', msg: 'Hospital deleted.' })
    setTimeout(() => setAlert(null), 3000)
  }

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    (h.sub_county || '').toLowerCase().includes(searchQ.toLowerCase())
  )

  if (authLoading || (user && !profile)) return <FullSpinner />

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Admin Access Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>This page is restricted to SCCL administrators.</p>
        <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
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
      width: '100%', textAlign: 'left',
    }}>
      <Icon size={15} /> {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', zIndex: 50,
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
          <NavBtn id="hospitals" label="Hospitals" icon={Building} />
          <NavBtn id="emergency" label="Emergency Contacts" icon={Phone} />
          <NavBtn id="overview" label="Overview" icon={LayoutDashboard} />
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

      {/* Main */}
      <div style={{ flex: 1, marginLeft: '220px' }}>
        <header style={{
          height: 'var(--nav-height)', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', flex: 1 }}>
            {tab === 'hospitals' && '🏥 Hospital Management'}
            {tab === 'emergency' && '🚨 Emergency Contacts'}
            {tab === 'overview' && '📊 Platform Overview'}
          </span>
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <main style={{ padding: '28px 24px' }}>
          {alert && <Alert type={alert.type} onClose={() => setAlert(null)} style={{ marginBottom: '20px' }}>{alert.msg}</Alert>}

          {tab === 'overview' && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <StatCard icon={<Building size={22} />} label="Total Hospitals" value={stats.hospitals} color="blue" />
                <StatCard icon={<Phone size={22} />} label="24/7 Emergency Units" value={stats.emergency} color="red" />
              </div>
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', marginBottom: '12px' }}>Platform Health</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {hospitals.filter(h => h.is_verified).length} verified · {hospitals.filter(h => !h.is_active).length} inactive · {hospitals.filter(h => h.emergency_available).length} with 24/7 emergency
                </p>
              </Card>
            </div>
          )}

          {tab === 'hospitals' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '360px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', padding: '0 12px',
                }}>
                  <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search hospitals..."
                    style={{ border: 'none', background: 'none', outline: 'none', padding: '9px 0', fontSize: '13px', fontFamily: 'var(--font-body)', flex: 1, color: 'var(--text-primary)' }} />
                </div>
                <Button variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Add Hospital</Button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <Spinner size={32} color="var(--accent-primary)" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredHospitals.map(h => (
                    <div key={h.id} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>{h.name}</span>
                          {h.is_verified && <Badge variant="verified">Verified</Badge>}
                          {h.emergency_available && <Badge variant="danger">Emergency</Badge>}
                          {!h.is_active && <Badge variant="warning">Inactive</Badge>}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {h.sub_county} · {h.phone || 'No phone'} · {h.hospital_services?.length || 0} services
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="ghost" size="sm" icon={<Eye size={13} />}
                          onClick={() => window.open(`/facility/${h.slug || h.id}`, '_blank')} />
                        <Button variant="outline" size="sm" icon={<Pencil size={13} />} onClick={() => openEdit(h)}>Edit</Button>
                        <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setDeleteConfirm(h)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                  {filteredHospitals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      {searchQ ? `No hospitals matching "${searchQ}".` : 'No hospitals yet. Click "Add Hospital" to create one.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'emergency' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {emergencyContacts.map(c => (
                  <div key={c.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{c.name}</span>
                        <Badge variant={c.category === 'ambulance' ? 'danger' : c.category === 'scd_hotline' ? 'primary' : 'success'}>
                          {c.category.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.description} · {c.phone}</p>
                    </div>
                    <Button variant="outline" size="sm" icon={<Pencil size={13} />}>Edit</Button>
                  </div>
                ))}
                {emergencyContacts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No emergency contacts. Run the seed SQL to populate them.</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Hospital Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Hospital' : 'Add Hospital'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="modal-2col">
            <Input label="Hospital Name *" value={editForm.name} onChange={set('name')} />
            <Input label="Phone" value={editForm.phone} onChange={set('phone')} />
          </div>
          <Textarea label="Description" value={editForm.description} onChange={set('description')} rows={2} />
          <Input label="Full Address" value={editForm.address} onChange={set('address')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="modal-2col">
            <Select label="Sub-County" value={editForm.sub_county} onChange={set('sub_county')}>
              <option value="">Select...</option>
              {SUB_COUNTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input label="Hospital Email" type="email" value={editForm.email} onChange={set('email')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="modal-2col">
            <Input label="Latitude" type="number" step="0.0001" value={editForm.latitude} onChange={set('latitude')} placeholder="e.g. 0.3532" />
            <Input label="Longitude" type="number" step="0.0001" value={editForm.longitude} onChange={set('longitude')} placeholder="e.g. 32.7559" />
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <Checkbox label="Verified" checked={editForm.is_verified} onChange={set('is_verified')} />
            <Checkbox label="24/7 Emergency" checked={editForm.emergency_available} onChange={set('emergency_available')} />
            <Checkbox label="Active / Visible" checked={editForm.is_active} onChange={set('is_active')} />
          </div>

          {/* Doctor account section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <UserPlus size={15} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                {editId ? 'Assign / Replace Doctor Account' : 'Doctor Login Account *'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
              {editId
                ? 'Leave blank to keep the existing doctor account. Fill in to create a new one and link it to this hospital.'
                : 'The doctor will use these credentials to sign in and manage this hospital\'s services at /doctor.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                label={editId ? 'New Doctor Email (optional)' : 'Doctor Email *'}
                type="email" value={editForm.doctorEmail} onChange={set('doctorEmail')}
                placeholder="doctor@hospital.ug"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="modal-2col">
                <Input
                  label={editId ? 'New Doctor Password (optional)' : 'Doctor Password *'}
                  type="password" value={editForm.doctorPassword} onChange={set('doctorPassword')}
                  placeholder="Min. 6 characters"
                />
                <Input
                  label="Doctor Full Name"
                  value={editForm.doctorName} onChange={set('doctorName')}
                  placeholder="e.g. Dr. Jane Smith"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={saveHospital}>
              {editId ? 'Save Changes' : 'Create Hospital & Doctor'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Hospital" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This removes all services, specialists, and linked data and cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => deleteHospital(deleteConfirm.id)}>
            Delete Permanently
          </Button>
        </div>
      </Modal>

      <style>{`@media (max-width: 640px) { .modal-2col { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function FullSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <Spinner size={40} color="var(--accent-primary)" />
    </div>
  )
}
