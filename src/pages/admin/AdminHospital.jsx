// src/pages/admin/AdminHospital.jsx
// Route: /admin/hospital  — hospital_admin only, not linked publicly
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Users, Mail, Plus, Check, X, Copy,
  LogOut, MapPin, Phone, Clock, Stethoscope,
  Trash2, RefreshCw, ExternalLink, UserPlus,
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import {
  supabase, signOut,
  getFacilityById, hospitalUpdateFacility,
  createDoctorInvitation, getInvitationsByFacility,
} from '../../lib/supabase';
import { Button, Input, Badge, Spinner } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';

// ─── Shared styles ─────────────────────────────────────────────────────────
const S = {
  sidebar: { width: 220, background: '#0f2744', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  main:    { flex: 1, background: 'var(--gray-50)', overflowY: 'auto' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
    color: active ? '#fff' : 'rgba(255,255,255,.55)', fontSize: 14,
    fontWeight: active ? 700 : 400, background: active ? 'rgba(255,255,255,.1)' : 'transparent',
    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    borderLeft: active ? '3px solid #3B82F6' : '3px solid transparent',
    transition: 'all 0.15s',
  }),
  card:  { background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6, fontFamily: "'Plus Jakarta Sans',sans-serif" },
};

// ─── Array field editor (services, treatments, specialists, tags) ─────────────
const ArrayField = ({ label, value = [], onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); setInput(''); }
  };
  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {value.map(v => (
          <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--blue-pale)', color: 'var(--blue)', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 }}>
            {v}
            <button type="button" onClick={() => onChange(value.filter(x => x !== v))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', padding: 0, display: 'flex' }}>
              <X size={11} />
            </button>
          </span>
        ))}
        {value.length === 0 && <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>None added yet</span>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          style={{ flex: 1, padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        <button type="button" onClick={add}
          style={{ padding: '8px 14px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Add
        </button>
      </div>
    </div>
  );
};

// ─── Facility profile tab ─────────────────────────────────────────────────────
const FacilityTab = ({ facilityId }) => {
  const [facility, setFacility] = useState(null);
  const [form,     setForm]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getFacilityById(facilityId).then(({ data }) => {
      setFacility(data); setForm(data); setLoading(false);
    });
  }, [facilityId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await hospitalUpdateFacility(facilityId, {
      phone:       form.phone,
      email:       form.email,
      description: form.description,
      sickle_cell_services: form.sickle_cell_services,
      diagnosis_services:   form.diagnosis_services,
      treatments:   form.treatments,
      specialists:  form.specialists,
      tags:         form.tags,
      latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      opening_hours: form.opening_hours,
    });
    if (error) toast(error.message, 'error');
    else toast('Facility profile saved successfully', 'success');
    setSaving(false);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;
  if (!form)   return <div style={{ padding: 40, color: 'var(--gray-500)' }}>Facility data not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Basic info card */}
      <div style={{ ...S.card, padding: 28 }}>
        <h3 style={{ fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={16} color="var(--blue)" /> Basic Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={S.label}>Facility Name</label>
            <div style={{ padding: '10px 14px', background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, color: 'var(--gray-700)' }}>
              {form.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Contact the system admin to change the name</div>
          </div>
          <div>
            <label style={S.label}>Address</label>
            <div style={{ padding: '10px 14px', background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, color: 'var(--gray-700)' }}>
              {form.address || '—'}
            </div>
          </div>
          <Input label="Phone Number" value={form.phone || ''} onChange={e => set('phone', e.target.value)} icon={Phone} placeholder="+256 700 000 000" />
          <Input label="Email Address" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="info@hospital.ug" />
          <Input label="Latitude" type="number" step="any" value={form.latitude || ''} onChange={e => set('latitude', e.target.value)} placeholder="0.3536" />
          <Input label="Longitude" type="number" step="any" value={form.longitude || ''} onChange={e => set('longitude', e.target.value)} placeholder="32.7564" />
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={S.label}>Description</label>
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3}
            placeholder="A short description of your facility…"
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Services */}
      <div style={{ ...S.card, padding: 28 }}>
        <h3 style={{ fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stethoscope size={16} color="var(--blue)" /> Services & Capabilities
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ArrayField label="Sickle Cell Services" value={form.sickle_cell_services || []} onChange={v => set('sickle_cell_services', v)} placeholder="e.g. Hydroxyurea Treatment" />
          <ArrayField label="Diagnosis Services"   value={form.diagnosis_services   || []} onChange={v => set('diagnosis_services', v)}   placeholder="e.g. Hemoglobin Electrophoresis" />
          <ArrayField label="Treatments"           value={form.treatments           || []} onChange={v => set('treatments', v)}           placeholder="e.g. Blood Transfusion" />
          <ArrayField label="Specialists"          value={form.specialists          || []} onChange={v => set('specialists', v)}          placeholder="e.g. Hematologist" />
          <ArrayField label="Tags / Categories"    value={form.tags                 || []} onChange={v => set('tags', v)}                 placeholder="e.g. Emergency Care" />
        </div>
      </div>

      {/* Opening hours */}
      <div style={{ ...S.card, padding: 28 }}>
        <h3 style={{ fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} color="var(--blue)" /> Operating Hours
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
            <div key={day}>
              <label style={{ ...S.label, textTransform: 'capitalize' }}>{day}</label>
              <input
                value={(form.opening_hours || {})[day] || ''}
                onChange={e => set('opening_hours', { ...(form.opening_hours || {}), [day]: e.target.value })}
                placeholder="e.g. 08:00-17:00 or Closed"
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={S.label}>Emergency / 24h</label>
            <input
              value={(form.opening_hours || {}).emergency || ''}
              onChange={e => set('opening_hours', { ...(form.opening_hours || {}), emergency: e.target.value })}
              placeholder="e.g. 24/7 or None"
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleSave} loading={saving} size="lg" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={15} /> Save All Changes
        </Button>
      </div>
    </div>
  );
};

// ─── Doctors tab ──────────────────────────────────────────────────────────────
const DoctorsTab = ({ facilityId, facilityName }) => {
  const [doctors,      setDoctors]      = useState([]);
  const [invitations,  setInvitations]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [invEmail,     setInvEmail]     = useState('');
  const [invLoading,   setInvLoading]   = useState(false);
  const [copiedId,     setCopiedId]     = useState(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [docsResult, invResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('facility_id', facilityId).eq('role', 'doctor'),
      getInvitationsByFacility(facilityId),
    ]);
    setDoctors(docsResult.data || []);
    setInvitations(invResult.data || []);
    setLoading(false);
  }, [facilityId]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!invEmail.trim()) return;
    setInvLoading(true);
    const { data, error } = await createDoctorInvitation({ email: invEmail, facilityId });
    if (error) toast(error.message, 'error');
    else {
      toast(`Invitation created for ${invEmail}`, 'success');
      setInvEmail('');
      setInvitations(prev => [data, ...prev]);
    }
    setInvLoading(false);
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/doctor/signup?token=${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(token);
      toast('Invite link copied!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const deleteInvitation = async (id) => {
    await supabase.from('doctor_invitations').delete().eq('id', id);
    setInvitations(prev => prev.filter(i => i.id !== id));
    toast('Invitation removed', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Create invitation */}
      <div style={{ ...S.card, padding: 28 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={16} color="var(--blue)" /> Invite a Doctor
        </h3>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20, lineHeight: 1.6 }}>
          Enter the doctor's email to generate a secure one-time signup link. Doctors cannot sign up on their own — only through this invitation.
        </p>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="doctor@hospital.ug" icon={Mail} required />
          </div>
          <Button type="submit" loading={invLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-end', height: 42 }}>
            <Plus size={14} /> Generate Link
          </Button>
        </form>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div style={S.card}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Pending Invitations ({invitations.filter(i => !i.used).length})</h3>
          </div>
          <div>
            {invitations.map(inv => {
              const expired = new Date(inv.expires_at) < new Date();
              return (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--gray-50)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: inv.used ? 'var(--green-light)' : expired ? 'var(--red-light)' : 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={15} color={inv.used ? 'var(--green)' : expired ? 'var(--red)' : 'var(--blue)'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{inv.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                        {inv.used ? 'Used ✓' : expired ? 'Expired' : `Expires ${new Date(inv.expires_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    {inv.used && <Badge color="green" style={{ fontSize: 10 }}>Registered</Badge>}
                    {!inv.used && expired && <Badge color="red" style={{ fontSize: 10 }}>Expired</Badge>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!inv.used && !expired && (
                      <button onClick={() => copyLink(inv.token)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 7, background: copiedId === inv.token ? 'var(--green-light)' : '#fff', cursor: 'pointer', fontSize: 12, color: copiedId === inv.token ? 'var(--green)' : 'var(--gray-600)' }}>
                        {copiedId === inv.token ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === inv.token ? 'Copied!' : 'Copy Link'}
                      </button>
                    )}
                    <button onClick={() => deleteInvitation(inv.id)}
                      style={{ padding: '7px', border: '1.5px solid var(--red-light)', borderRadius: 7, background: 'var(--red-light)', cursor: 'pointer', display: 'flex' }}>
                      <Trash2 size={13} color="var(--red)" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active doctors */}
      <div style={S.card}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Active Doctors ({doctors.length})</h3>
          <button onClick={load} style={{ padding: '6px', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
            <RefreshCw size={13} color="var(--gray-500)" />
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : doctors.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>
            No doctors registered yet. Use the form above to invite them.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 24px', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--gray-100)', background: 'var(--gray-50)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.id}>
                  <td style={{ padding: '14px 24px', fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>
                        {(d.full_name || d.email || 'D')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{d.full_name || 'No name'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: 'var(--gray-500)' }}>{d.email}</td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--gray-400)' }}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <Badge color="green" style={{ fontSize: 10 }}>Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── Main Hospital Admin page ─────────────────────────────────────────────────
export const AdminHospital = () => {
  const { user, profile, isHospitalAdmin, isSuperAdmin, loading } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();
  const [tab, setTab] = useState('facility');

  const facilityId = profile?.facility_id;

  useEffect(() => {
    if (!loading && !isHospitalAdmin && !isSuperAdmin) {
      toast('Access denied. Hospital admin only.', 'error');
      navigate('/doctor/login');
    }
  }, [loading, isHospitalAdmin, isSuperAdmin, navigate, toast]);

  const handleSignOut = async () => { await signOut(); navigate('/doctor/login'); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>;
  if (!isHospitalAdmin && !isSuperAdmin) return null;

  if (!facilityId) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flexDirection: 'column', gap: 16 }}>
      <Building2 size={48} color="var(--gray-300)" />
      <h2 style={{ fontSize: 20 }}>No facility assigned</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', textAlign: 'center', maxWidth: 360 }}>
        Your account hasn't been linked to a facility yet. Please contact the system administrator.
      </p>
    </div>
  );

  const TABS = [
    { key: 'facility', label: 'Facility Profile', icon: Building2 },
    { key: 'doctors',  label: 'Doctors',          icon: Users },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>SCCL Admin</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', paddingLeft: 42 }}>Hospital Portal</div>
        </div>

        <nav style={{ padding: '12px 0', flex: 1 }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={S.navItem(tab === key)}>
              <Icon size={16} /> {label}
            </button>
          ))}
          <div style={{ margin: '12px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }} />
          <Link to="/" style={{ ...S.navItem(false), textDecoration: 'none', display: 'flex' }}>
            <ExternalLink size={16} /> Public Site
          </Link>
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Signed in as</div>
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
              {tab === 'facility' ? 'Facility Profile' : 'Manage Doctors'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>
              {tab === 'facility' ? 'Update your facility's information, services, and hours.' : 'Invite doctors and manage your medical staff.'}
            </p>
          </div>

          {tab === 'facility' && <FacilityTab facilityId={facilityId} />}
          {tab === 'doctors'  && <DoctorsTab  facilityId={facilityId} facilityName={profile?.facilities?.name} />}
        </div>
      </div>
    </div>
  );
};
