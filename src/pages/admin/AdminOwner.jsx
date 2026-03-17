// src/pages/admin/AdminOwner.jsx
// Route: /admin/owner  — super_admin only, not linked publicly
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, Plus, Pencil, Trash2, X, Check,
  LogOut, ChevronDown, Search, MapPin, Phone, Shield,
  Activity, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import {
  supabase, signOut,
  getFacilities, adminCreateFacility, adminUpdateFacility, adminDeleteFacility,
  adminGetProfiles, adminSetRole,
} from '../../lib/supabase';
import { Button, Badge, Spinner, Input } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  sidebar: { width: 220, background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  main:    { flex: 1, background: 'var(--gray-50)', overflowY: 'auto' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
    color: active ? '#fff' : 'rgba(255,255,255,.55)', fontSize: 14,
    fontWeight: active ? 700 : 400, background: active ? 'rgba(255,255,255,.1)' : 'transparent',
    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
    fontFamily: "'Plus Jakarta Sans',sans-serif", borderRadius: 0,
    borderLeft: active ? '3px solid #3B82F6' : '3px solid transparent',
    transition: 'all 0.15s',
  }),
  card: { background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', padding: 24 },
  th:   { padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', textAlign: 'left' },
  td:   { padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--gray-100)', color: 'var(--gray-700)', verticalAlign: 'middle' },
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const Stat = ({ label, value, icon: Icon, color }) => (
  <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--gray-900)', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

// ─── Facility modal ───────────────────────────────────────────────────────────
const FACILITY_TYPES = ['public', 'private', 'ngo'];
const BOOL_FIELDS = [
  ['is_featured', 'Featured on homepage'],
  ['is_verified', 'Verified facility'],
  ['has_emergency', '24/7 Emergency'],
  ['has_diagnosis', 'Has diagnosis services'],
];

const emptyFacility = {
  name: '', address: '', sub_county: '', district: 'Mukono',
  phone: '', email: '', latitude: '', longitude: '',
  facility_type: 'public', is_featured: false, is_verified: false,
  has_emergency: false, has_diagnosis: false, description: '',
};

const FacilityModal = ({ facility, onClose, onSave }) => {
  const [form, setForm]   = useState(facility ? { ...facility } : { ...emptyFacility });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Facility name is required', 'error'); return; }
    setSaving(true);
    const payload = {
      ...form,
      latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    };
    const result = facility?.id
      ? await adminUpdateFacility(facility.id, payload)
      : await adminCreateFacility(payload);
    if (result.error) { toast(result.error.message, 'error'); setSaving(false); return; }
    toast(facility?.id ? 'Facility updated' : 'Facility created', 'success');
    onSave(result.data);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h2 style={{ fontSize: 18 }}>{facility?.id ? 'Edit Facility' : 'Add New Facility'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={20} /></button>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basic info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Facility Name *" value={form.name} onChange={e => set('name', e.target.value)} style={{ gridColumn: '1 / -1' }} />
            <Input label="Address" value={form.address || ''} onChange={e => set('address', e.target.value)} />
            <Input label="Sub-county" value={form.sub_county || ''} onChange={e => set('sub_county', e.target.value)} />
            <Input label="Phone" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
            <Input label="Email" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
            <Input label="Latitude" type="number" step="any" value={form.latitude || ''} onChange={e => set('latitude', e.target.value)} placeholder="e.g. 0.3536" />
            <Input label="Longitude" type="number" step="any" value={form.longitude || ''} onChange={e => set('longitude', e.target.value)} placeholder="e.g. 32.7564" />
          </div>

          {/* Type */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Facility Type</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {FACILITY_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('facility_type', t)}
                  style={{ padding: '7px 16px', borderRadius: 6, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", background: form.facility_type === t ? 'var(--blue)' : '#fff', color: form.facility_type === t ? '#fff' : 'var(--gray-600)', borderColor: form.facility_type === t ? 'var(--blue)' : 'var(--gray-200)', textTransform: 'capitalize' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Booleans */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Flags</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {BOOL_FIELDS.map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, padding: '8px 12px', borderRadius: 8, background: form[key] ? 'var(--blue-pale)' : 'var(--gray-50)', border: `1px solid ${form[key] ? 'var(--blue)' : 'var(--gray-200)'}` }}>
                  <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} style={{ accentColor: 'var(--blue)', width: 15, height: 15 }} />
                  <span style={{ color: form[key] ? 'var(--blue)' : 'var(--gray-700)', fontWeight: form[key] ? 600 : 400 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Description</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Optional facility description…"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0, background: '#fff' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} /> {facility?.id ? 'Save Changes' : 'Create Facility'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete confirm ───────────────────────────────────────────────────────────
const ConfirmDelete = ({ name, onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}>
      <div style={{ width: 56, height: 56, background: 'var(--red-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Trash2 size={24} color="var(--red)" />
      </div>
      <h3 style={{ fontSize: 18, marginBottom: 8 }}>Delete Facility?</h3>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Are you sure you want to delete <strong>{name}</strong>? This cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Yes, Delete</Button>
      </div>
    </div>
  </div>
);

// ─── Facilities tab ───────────────────────────────────────────────────────────
const FacilitiesTab = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search,  setSearch]        = useState('');
  const [modal,   setModal]         = useState(null); // null | 'new' | facility obj
  const [deleting, setDeleting]     = useState(null); // facility obj
  const [delLoading, setDelLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getFacilities({ search: search || undefined });
    setFacilities(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    setDelLoading(true);
    const { error } = await adminDeleteFacility(deleting.id);
    if (error) toast(error.message, 'error');
    else { toast('Facility deleted', 'success'); setFacilities(f => f.filter(x => x.id !== deleting.id)); }
    setDelLoading(false); setDeleting(null);
  };

  const handleSaved = (saved) => {
    setFacilities(prev => {
      const idx = prev.findIndex(f => f.id === saved.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy; }
      return [saved, ...prev];
    });
    setModal(null);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search facilities…"
            style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} style={{ padding: '9px', border: '1.5px solid var(--gray-200)', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
            <RefreshCw size={14} color="var(--gray-500)" />
          </button>
          <Button onClick={() => setModal('new')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Facility
          </Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Facility', 'Sub-county', 'Type', 'Flags', 'Phone', 'Actions'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', padding: 32 }}><Spinner /></td></tr>
            ) : facilities.length === 0 ? (
              <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No facilities found</td></tr>
            ) : facilities.map(f => (
              <tr key={f.id} style={{ transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{f.name}</div>
                  {f.address && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{f.address}</div>}
                </td>
                <td style={S.td}>{f.sub_county || '—'}</td>
                <td style={S.td}>
                  <Badge color={f.facility_type === 'public' ? 'blue' : f.facility_type === 'private' ? 'yellow' : 'gray'} style={{ textTransform: 'capitalize' }}>
                    {f.facility_type || '—'}
                  </Badge>
                </td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {f.is_featured  && <Badge color="yellow" style={{ fontSize: 10 }}>Featured</Badge>}
                    {f.is_verified  && <Badge color="green"  style={{ fontSize: 10 }}>Verified</Badge>}
                    {f.has_emergency&& <Badge color="red"    style={{ fontSize: 10 }}>24/7</Badge>}
                    {f.has_diagnosis&& <Badge color="blue"   style={{ fontSize: 10 }}>Diagnosis</Badge>}
                  </div>
                </td>
                <td style={S.td}>{f.phone || '—'}</td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setModal(f)}
                      style={{ padding: '6px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--gray-600)' }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleting(f)}
                      style={{ padding: '6px 12px', border: '1.5px solid var(--red-light)', borderRadius: 6, background: 'var(--red-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--red)' }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <FacilityModal
          facility={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}
      {deleting && (
        <ConfirmDelete name={deleting.name} onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={delLoading} />
      )}
    </div>
  );
};

// ─── Users tab ────────────────────────────────────────────────────────────────
const ROLES = ['patient', 'doctor', 'hospital_admin', 'super_admin'];
const ROLE_COLORS = { patient: 'gray', doctor: 'blue', hospital_admin: 'green', super_admin: 'red' };

const UsersTab = ({ facilities }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [editing,  setEditing]  = useState(null); // { id, role, facility_id }
  const { toast } = useToast();

  useEffect(() => {
    adminGetProfiles().then(({ data }) => { setProfiles(data || []); setLoading(false); });
  }, []);

  const filtered = profiles.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleSave = async () => {
    const { error } = await adminSetRole(editing.id, editing.role, editing.facility_id || null);
    if (error) toast(error.message, 'error');
    else {
      toast('Role updated', 'success');
      setProfiles(prev => prev.map(p => p.id === editing.id ? { ...p, role: editing.role, facility_id: editing.facility_id } : p));
      setEditing(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center' }}>
          {profiles.length} total users
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['User', 'Email', 'Role', 'Facility', 'Joined', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', padding: 32 }}><Spinner /></td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td style={S.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>
                      {(p.full_name || p.email || 'U')[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{p.full_name || 'No name'}</span>
                  </div>
                </td>
                <td style={{ ...S.td, fontSize: 13 }}>{p.email}</td>
                <td style={S.td}><Badge color={ROLE_COLORS[p.role] || 'gray'} style={{ textTransform: 'capitalize', fontSize: 11 }}>{p.role?.replace('_', ' ')}</Badge></td>
                <td style={{ ...S.td, fontSize: 13, color: 'var(--gray-500)' }}>{p.facilities?.name || '—'}</td>
                <td style={{ ...S.td, fontSize: 12, color: 'var(--gray-400)' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                <td style={S.td}>
                  <button onClick={() => setEditing({ id: p.id, role: p.role, facility_id: p.facility_id || '' })}
                    style={{ padding: '6px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Shield size={12} /> Role
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit role modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Change Role</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Role</label>
                <select value={editing.role} onChange={e => setEditing(v => ({ ...v, role: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              {(editing.role === 'doctor' || editing.role === 'hospital_admin') && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Facility</label>
                  <select value={editing.facility_id || ''} onChange={e => setEditing(v => ({ ...v, facility_id: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}>
                    <option value="">— None —</option>
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleRoleSave}>Save Role</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Admin Owner page ────────────────────────────────────────────────────
export const AdminOwner = () => {
  const { user, isSuperAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab]             = useState('facilities');
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    if (!loading && !isSuperAdmin) {
      toast('Access denied. Super admin only.', 'error');
      navigate('/doctor/login');
    }
  }, [loading, isSuperAdmin, navigate, toast]);

  useEffect(() => {
    getFacilities().then(({ data }) => setFacilities(data || []));
  }, []);

  const handleSignOut = async () => { await signOut(); navigate('/doctor/login'); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>;
  if (!isSuperAdmin) return null;

  const TABS = [
    { key: 'facilities', label: 'Facilities',   icon: Building2 },
    { key: 'users',      label: 'Users & Roles', icon: Users },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>SCCL Admin</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', paddingLeft: 42 }}>Owner Portal</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={S.navItem(tab === key)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={S.main}>
        <div style={{ padding: '28px 32px' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              {tab === 'facilities' ? 'Manage Facilities' : 'Users & Roles'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>
              {tab === 'facilities' ? 'Add, edit and remove health facilities on the platform.' : 'View all users and assign roles.'}
            </p>
          </div>

          {tab === 'facilities' && <FacilitiesTab />}
          {tab === 'users'      && <UsersTab facilities={facilities} />}
        </div>
      </div>
    </div>
  );
};
