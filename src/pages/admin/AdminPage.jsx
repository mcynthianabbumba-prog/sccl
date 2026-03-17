import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building, Users, Phone, Activity,
  Plus, Pencil, Trash2, CheckCircle, XCircle, Search,
  Sun, Moon, LogOut, ChevronRight, Eye
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
  'Mukono Town', 'Seeta', 'Goma', 'Ntenjeru', 'Buikwe', 'Lugazi', 'Njeru', 'Katosi', 'Kayunga', 'Other',
]

const SERVICES = [
  'sickle_cell_testing', 'hydroxyurea_treatment', 'blood_transfusion',
  'pain_crisis_management', 'lab_services', 'newborn_screening',
  'genetic_counseling', 'hemoglobin_electrophoresis', 'pneumococcal_vaccines',
  'maternal_health', 'pediatrics', 'pharmacy', 'radiology', 'outpatient',
]

const emptyHospital = {
  name: '', description: '', address: '', sub_county: '',
  phone: '', email: '', website: '', latitude: '', longitude: '',
  emergency_available: false, is_verified: false, is_active: true,
}

export default function AdminPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [stats, setStats] = useState({ hospitals: 0, doctors: 0, emergency: 0 })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('hospitals')
  const [searchQ, setSearchQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editHospital, setEditHospital] = useState(emptyHospital)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [alert, setAlert] = useState(null)
  const navigate = useNavigate()

  // Access check: only site admin email or admin role
  const isAdmin = profile?.role === 'admin' || user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (isAdmin) loadAll()
  }, [user, isAdmin])

  async function loadAll() {
    setLoading(true)
    const [hospRes, docRes, emRes] = await Promise.all([
      supabase.from('hospitals').select('*, hospital_services(*)').order('name'),
      supabase.from('doctors').select('*, profile:profiles(*), hospital:hospitals(name)').order('created_at', { ascending: false }),
      supabase.from('emergency_contacts').select('*').order('sort_order'),
    ])
    setHospitals(hospRes.data || [])
    setDoctors(docRes.data || [])
    setEmergencyContacts(emRes.data || [])
    const emergency = (hospRes.data || []).filter(h => h.emergency_available).length
    setStats({ hospitals: hospRes.data?.length || 0, doctors: docRes.data?.length || 0, emergency })
    setLoading(false)
  }

  const openCreate = () => { setEditHospital(emptyHospital); setEditId(null); setModalOpen(true) }
  const openEdit = (h) => {
    setEditHospital({
      name: h.name || '', description: h.description || '',
      address: h.address || '', sub_county: h.sub_county || '',
      phone: h.phone || '', email: h.email || '', website: h.website || '',
      latitude: h.latitude || '', longitude: h.longitude || '',
      emergency_available: h.emergency_available || false,
      is_verified: h.is_verified || false, is_active: h.is_active !== false,
    })
    setEditId(h.id)
    setModalOpen(true)
  }

  const saveHospital = async () => {
    setSaving(true)
    const payload = {
      ...editHospital,
      latitude: parseFloat(editHospital.latitude) || null,
      longitude: parseFloat(editHospital.longitude) || null,
      slug: editHospital.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      updated_at: new Date().toISOString(),
    }
    let error
    if (editId) {
      ({ error } = await supabase.from('hospitals').update(payload).eq('id', editId))
    } else {
      ({ error } = await supabase.from('hospitals').insert(payload))
    }
    setSaving(false)
    if (error) { setAlert({ type: 'error', msg: error.message }); return }
    setAlert({ type: 'success', msg: `Hospital ${editId ? 'updated' : 'created'} successfully.` })
    setModalOpen(false)
    loadAll()
    setTimeout(() => setAlert(null), 4000)
  }

  const deleteHospital = async (id) => {
    await supabase.from('hospitals').delete().eq('id', id)
    setDeleteConfirm(null)
    setAlert({ type: 'success', msg: 'Hospital deleted.' })
    loadAll()
    setTimeout(() => setAlert(null), 3000)
  }

  const toggleDoctorApproval = async (doctor) => {
    await supabase.from('doctors').update({ is_approved: !doctor.is_approved }).eq('id', doctor.id)
    loadAll()
  }

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    h.sub_county?.toLowerCase().includes(searchQ.toLowerCase())
  )

  // Show spinner while auth/profile is still resolving
  if (authLoading || (user && !profile)) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <Spinner size={40} color="var(--accent-primary)" />
    </div>
  )

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
    <button
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '9px 14px', borderRadius: 'var(--radius-md)',
        background: tab === id ? 'var(--blue-50)' : 'transparent',
        border: 'none', cursor: 'pointer',
        color: tab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontWeight: tab === id ? 700 : 500, fontSize: '13px',
        fontFamily: 'var(--font-body)',
        borderLeft: `3px solid ${tab === id ? 'var(--accent-primary)' : 'transparent'}`,
      }}
    >
      <Icon size={15} /> {label}
    </button>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh',
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
          <NavBtn id="doctors" label="Doctors" icon={Users} />
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
        {/* Header */}
        <header style={{
          height: 'var(--nav-height)', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', flex: 1 }}>
            {tab === 'hospitals' && '🏥 Hospital Management'}
            {tab === 'doctors' && '👨‍⚕️ Doctor Management'}
            {tab === 'emergency' && '🚨 Emergency Contacts'}
            {tab === 'overview' && '📊 Platform Overview'}
          </span>
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <main style={{ padding: '28px 24px' }}>
          {alert && <Alert type={alert.type} onClose={() => setAlert(null)} style={{ marginBottom: '20px' }}>{alert.msg}</Alert>}

          {/* Overview Tab */}
          {tab === 'overview' && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <StatCard icon={<Building size={22} />} label="Total Hospitals" value={stats.hospitals} color="blue" />
                <StatCard icon={<Users size={22} />} label="Registered Doctors" value={stats.doctors} color="green" />
                <StatCard icon={<Phone size={22} />} label="Emergency Units" value={stats.emergency} color="red" />
              </div>
              <Card>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', marginBottom: '16px' }}>Platform Health</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  All systems operational. {hospitals.filter(h => h.is_verified).length} verified facilities,{' '}
                  {hospitals.filter(h => !h.is_active).length} inactive.
                </p>
              </Card>
            </div>
          )}

          {/* Hospitals Tab */}
          {tab === 'hospitals' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '360px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', padding: '0 12px',
                }}>
                  <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search hospitals..."
                    style={{ border: 'none', background: 'none', outline: 'none', padding: '9px 0', fontSize: '13px', fontFamily: 'var(--font-body)', flex: 1, color: 'var(--text-primary)' }}
                  />
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
                      No hospitals found matching "{searchQ}".
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Doctors Tab */}
          {tab === 'doctors' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Spinner size={32} color="var(--accent-primary)" />
                  </div>
                ) : doctors.map(doc => (
                  <div key={doc.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: doc.is_approved ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: doc.is_approved ? 'white' : 'var(--text-muted)',
                      fontWeight: 700,
                    }}>
                      {doc.profile?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px' }}>{doc.profile?.full_name || 'Unknown'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {doc.profile?.email} · {doc.specialty || 'No specialty'} · {doc.hospital?.name || 'No hospital'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Badge variant={doc.is_approved ? 'success' : 'warning'}>
                        {doc.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                      <Button
                        variant={doc.is_approved ? 'danger' : 'success'}
                        size="sm"
                        icon={doc.is_approved ? <XCircle size={13} /> : <CheckCircle size={13} />}
                        onClick={() => toggleDoctorApproval(doc)}
                      >
                        {doc.is_approved ? 'Revoke' : 'Approve'}
                      </Button>
                    </div>
                  </div>
                ))}
                {!loading && doctors.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>👨‍⚕️</div>
                    <p>No doctors registered yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Tab */}
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
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Hospital Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Hospital' : 'Add Hospital'} size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Hospital Name *" value={editHospital.name} onChange={e => setEditHospital(h => ({ ...h, name: e.target.value }))} />
            <Input label="Phone" value={editHospital.phone} onChange={e => setEditHospital(h => ({ ...h, phone: e.target.value }))} />
          </div>
          <Textarea label="Description" value={editHospital.description} onChange={e => setEditHospital(h => ({ ...h, description: e.target.value }))} rows={2} />
          <Input label="Full Address" value={editHospital.address} onChange={e => setEditHospital(h => ({ ...h, address: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select label="Sub-County" value={editHospital.sub_county} onChange={e => setEditHospital(h => ({ ...h, sub_county: e.target.value }))}>
              <option value="">Select...</option>
              {SUB_COUNTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input label="Email" type="email" value={editHospital.email} onChange={e => setEditHospital(h => ({ ...h, email: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input label="Latitude" type="number" step="0.0001" value={editHospital.latitude} onChange={e => setEditHospital(h => ({ ...h, latitude: e.target.value }))} placeholder="e.g. 0.3532" />
            <Input label="Longitude" type="number" step="0.0001" value={editHospital.longitude} onChange={e => setEditHospital(h => ({ ...h, longitude: e.target.value }))} placeholder="e.g. 32.7559" />
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <Checkbox label="Verified" checked={editHospital.is_verified} onChange={e => setEditHospital(h => ({ ...h, is_verified: e.target.checked }))} />
            <Checkbox label="24/7 Emergency" checked={editHospital.emergency_available} onChange={e => setEditHospital(h => ({ ...h, emergency_available: e.target.checked }))} />
            <Checkbox label="Active / Visible" checked={editHospital.is_active} onChange={e => setEditHospital(h => ({ ...h, is_active: e.target.checked }))} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={saveHospital}>
              {editId ? 'Save Changes' : 'Create Hospital'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Hospital" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This will also remove all associated services and specialist records. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => deleteHospital(deleteConfirm.id)}>
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  )
}
