// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut, ExternalLink, Bell, Calendar, FileText, MessageSquare,
  User, Building2, Phone, Clock, Plus, Check, AlertTriangle,
  Stethoscope, Activity, X, Save, MapPin,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase, getFacilityById, signOut } from '../lib/supabase';
import { Card, Badge, Spinner, Button, Input } from '../components/ui';
import { useToast } from '../components/ui/Toast';

const NAV = [
  { key: 'dashboard',    label: 'Dashboard',      icon: Activity },
  { key: 'appointments', label: 'Appointments',   icon: Calendar },
  { key: 'records',      label: 'Patient Records',icon: FileText },
  { key: 'alerts',       label: 'Alerts',         icon: Bell },
  { key: 'messages',     label: 'Messages',       icon: MessageSquare },
  { key: 'profile',      label: 'My Profile',     icon: User },
];

const Sidebar = ({ active, setActive, profile, onSignOut }) => {
  const initials = (profile?.full_name || 'D').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ width: 220, background: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, background: 'var(--blue)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 14, color: '#fff' }}>SCCL</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: -1 }}>Staff Portal</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {initials}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{profile?.full_name || 'Doctor'}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>
          {profile?.role === 'hospital_admin' ? 'Hospital Admin' : profile?.specialization || 'Doctor'}
        </div>
      </div>
      <nav style={{ flex: 1, padding: '10px 0' }}>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActive(key)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
            color: active === key ? '#fff' : 'rgba(255,255,255,.5)',
            fontWeight: active === key ? 700 : 400, fontSize: 13,
            background: active === key ? 'rgba(59,130,246,.2)' : 'transparent',
            border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            borderLeft: active === key ? '3px solid #3B82F6' : '3px solid transparent',
            transition: 'all 0.15s',
          }}><Icon size={15} /> {label}</button>
        ))}
      </nav>
      <div style={{ padding: '12px 0', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', color: 'rgba(255,255,255,.4)', fontSize: 12, textDecoration: 'none' }}>
          <ExternalLink size={13} /> Public site
        </Link>
        <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px', color: '#f87171', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
};

const TopBar = ({ title, subtitle, urgentCount }) => (
  <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
    <div>
      <h1 style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>{subtitle}</p>}
    </div>
    {urgentCount > 0 && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#991B1B' }}>
        <AlertTriangle size={13} /> {urgentCount} urgent alert{urgentCount > 1 ? 's' : ''}
      </div>
    )}
  </div>
);

const DashboardHome = ({ profile, facility, appointments, records, alerts }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.scheduled_at).toDateString() === todayStr);
  const unreadAlerts = alerts.filter(a => !a.is_read);
  const urgentAlerts = alerts.filter(a => a.is_urgent && !a.is_read);

  const Stat = ({ icon: Icon, label, value, color, sub }) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4 }}>
          {greeting}, Dr. {(profile?.full_name || '').split(' ')[0]} 👋
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {facility && <> · <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{facility.name}</span></>}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <Stat icon={Calendar}    label="Today's Appointments" value={todayAppts.length}     color="var(--blue)"       sub={`${appointments.length} total`} />
        <Stat icon={FileText}    label="Patient Records"       value={records.length}        color="var(--green)"      sub="All records" />
        <Stat icon={Bell}        label="Unread Alerts"         value={unreadAlerts.length}   color={urgentAlerts.length > 0 ? 'var(--red)' : 'var(--yellow)'} sub={urgentAlerts.length > 0 ? `${urgentAlerts.length} urgent` : 'All clear'} />
        <Stat icon={Stethoscope} label="Role"                  value={profile?.role === 'hospital_admin' ? 'Admin' : 'Doctor'} color="var(--blue-light)" sub={profile?.specialization || ''} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Today's Appointments</h3>
            <Badge color="blue">{todayAppts.length}</Badge>
          </div>
          {todayAppts.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No appointments today</div>
            : todayAppts.map(a => (
              <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.patient_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{a.type?.replace('_', ' ')} · {a.duration_min} min</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>
                    {new Date(a.scheduled_at).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Badge color={a.status === 'completed' ? 'green' : a.status === 'cancelled' ? 'red' : 'blue'} style={{ fontSize: 10, marginTop: 3 }}>{a.status}</Badge>
                </div>
              </div>
            ))
          }
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Recent Alerts</h3>
            {urgentAlerts.length > 0 && <Badge color="red">{urgentAlerts.length} urgent</Badge>}
          </div>
          {alerts.length === 0
            ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No alerts</div>
            : alerts.slice(0, 6).map(a => (
              <div key={a.id} style={{ padding: '11px 16px', borderBottom: '1px solid var(--gray-50)', display: 'flex', gap: 10, alignItems: 'flex-start', background: a.is_urgent && !a.is_read ? '#FFF7F7' : '#fff' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.is_urgent ? 'var(--red)' : 'var(--blue)', flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: a.is_read ? 400 : 600, color: 'var(--gray-800)', lineHeight: 1.4 }}>{a.message}</div>
                  {a.patient_name && <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>Re: {a.patient_name}</div>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
      {facility && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200)', padding: 18, marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="var(--blue)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{facility.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', gap: 12, marginTop: 2 }}>
                {facility.address && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11}/>{facility.address}</span>}
                {facility.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11}/>{facility.phone}</span>}
              </div>
            </div>
          </div>
          <Link to={`/facility/${facility.id}`}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, color: 'var(--gray-600)' }}>
              <ExternalLink size={12} /> Public page
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

const AppointmentsPanel = ({ doctorId, facilityId }) => {
  const { toast } = useToast();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patient_name: '', scheduled_at: '', type: 'routine', duration_min: 30, notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').eq('doctor_id', doctorId).order('scheduled_at');
    setAppts(data || []); setLoading(false);
  }, [doctorId]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.patient_name || !form.scheduled_at) { toast('Name and date are required', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('appointments').insert([{ ...form, doctor_id: doctorId, facility_id: facilityId }]);
    if (error) toast(error.message, 'error');
    else { toast('Appointment added', 'success'); setShowForm(false); setForm({ patient_name: '', scheduled_at: '', type: 'routine', duration_min: 30, notes: '' }); load(); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => { await supabase.from('appointments').update({ status }).eq('id', id); load(); };
  const S = { scheduled: 'blue', completed: 'green', cancelled: 'red' };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Appointments</h2>
        <Button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14}/> New</Button>
      </div>
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>New Appointment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Input label="Patient Name"   value={form.patient_name}  onChange={e=>setForm(p=>({...p,patient_name:e.target.value}))} placeholder="Full name"/>
            <Input label="Date & Time"    type="datetime-local"      value={form.scheduled_at} onChange={e=>setForm(p=>({...p,scheduled_at:e.target.value}))}/>
            <div>
              <label style={{ fontSize:13,fontWeight:600,color:'var(--gray-700)',display:'block',marginBottom:6 }}>Type</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:6,fontSize:14,fontFamily:'inherit' }}>
                {['routine','follow_up','diagnostic','emergency'].map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <Input label="Duration (min)" type="number" value={form.duration_min} onChange={e=>setForm(p=>({...p,duration_min:+e.target.value}))}/>
          </div>
          <Input label="Notes" value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Optional notes" style={{ marginBottom:16 }}/>
          <div style={{ display:'flex',gap:10 }}>
            <Button onClick={save} loading={saving} style={{ display:'flex',alignItems:'center',gap:6 }}><Save size={13}/> Save</Button>
            <Button variant="ghost" onClick={()=>setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {loading ? <div style={{ display:'flex',justifyContent:'center',padding:40 }}><Spinner/></div> : (
        <div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--gray-200)',overflow:'hidden' }}>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'var(--gray-50)' }}>
              {['Patient','Date & Time','Type','Dur.','Status',''].map(h=>(
                <th key={h} style={{ padding:'10px 16px',fontSize:11,fontWeight:700,color:'var(--gray-500)',textTransform:'uppercase',letterSpacing:'0.05em',textAlign:'left',borderBottom:'1px solid var(--gray-200)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {appts.length===0 ? <tr><td colSpan={6} style={{ padding:32,textAlign:'center',color:'var(--gray-400)',fontSize:13 }}>No appointments yet</td></tr>
              : appts.map(a=>(
                <tr key={a.id} style={{ borderBottom:'1px solid var(--gray-50)' }}>
                  <td style={{ padding:'13px 16px',fontWeight:600,fontSize:14 }}>{a.patient_name}</td>
                  <td style={{ padding:'13px 16px',fontSize:13,color:'var(--gray-600)' }}>{new Date(a.scheduled_at).toLocaleString('en-UG',{dateStyle:'medium',timeStyle:'short'})}</td>
                  <td style={{ padding:'13px 16px',fontSize:13,color:'var(--gray-600)',textTransform:'capitalize' }}>{a.type?.replace('_',' ')}</td>
                  <td style={{ padding:'13px 16px',fontSize:13,color:'var(--gray-600)' }}>{a.duration_min}m</td>
                  <td style={{ padding:'13px 16px' }}><Badge color={S[a.status]||'gray'}>{a.status}</Badge></td>
                  <td style={{ padding:'13px 16px' }}>
                    {a.status==='scheduled' && <div style={{ display:'flex',gap:6 }}>
                      <button onClick={()=>updateStatus(a.id,'completed')} style={{ width:28,height:28,borderRadius:6,border:'1px solid var(--green)',background:'var(--green-light)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Check size={13} color="var(--green)"/></button>
                      <button onClick={()=>updateStatus(a.id,'cancelled')} style={{ width:28,height:28,borderRadius:6,border:'1px solid var(--red)',background:'var(--red-light)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={13} color="var(--red)"/></button>
                    </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const RecordsPanel = ({ doctorId, facilityId }) => {
  const { toast } = useToast();
  const [records,setRecords]=useState([]); const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false); const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({ title:'',patient_name:'',record_type:'consultation',description:'',status:'pending' });
  const load=useCallback(async()=>{setLoading(true);const{data}=await supabase.from('patient_records').select('*').eq('doctor_id',doctorId).order('created_at',{ascending:false});setRecords(data||[]);setLoading(false);},[doctorId]);
  useEffect(()=>{load();},[load]);
  const save=async()=>{if(!form.title){toast('Title required','error');return;}setSaving(true);const{error}=await supabase.from('patient_records').insert([{...form,doctor_id:doctorId,facility_id:facilityId}]);if(error)toast(error.message,'error');else{toast('Record saved','success');setShowForm(false);setForm({title:'',patient_name:'',record_type:'consultation',description:'',status:'pending'});load();}setSaving(false);};
  const TC={lab_result:'blue',prescription:'green',consultation:'gray',emergency:'red'};
  const SC={pending:'yellow',reviewed:'green',urgent:'red'};
  return(
    <div style={{ padding:28 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:800,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Patient Records</h2>
        <Button onClick={()=>setShowForm(v=>!v)} style={{ display:'flex',alignItems:'center',gap:6 }}><Plus size={14}/> New Record</Button>
      </div>
      {showForm&&(
        <div style={{ background:'#fff',border:'1px solid var(--gray-200)',borderRadius:12,padding:24,marginBottom:20 }}>
          <h3 style={{ fontSize:15,fontWeight:700,marginBottom:16 }}>New Patient Record</h3>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 }}>
            <Input label="Patient Name" value={form.patient_name} onChange={e=>setForm(p=>({...p,patient_name:e.target.value}))} placeholder="Full name"/>
            <Input label="Title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Monthly check-up"/>
            <div>
              <label style={{ fontSize:13,fontWeight:600,color:'var(--gray-700)',display:'block',marginBottom:6 }}>Type</label>
              <select value={form.record_type} onChange={e=>setForm(p=>({...p,record_type:e.target.value}))} style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:6,fontSize:14,fontFamily:'inherit' }}>
                {['consultation','lab_result','prescription','emergency'].map(t=><option key={t} value={t}>{t.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:13,fontWeight:600,color:'var(--gray-700)',display:'block',marginBottom:6 }}>Status</label>
              <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:6,fontSize:14,fontFamily:'inherit' }}>
                {['pending','reviewed','urgent'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13,fontWeight:600,color:'var(--gray-700)',display:'block',marginBottom:6 }}>Clinical Notes</label>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Findings, prescriptions…" style={{ width:'100%',padding:'10px 12px',border:'1.5px solid var(--gray-200)',borderRadius:6,fontSize:14,fontFamily:'inherit',resize:'vertical',outline:'none' }}/>
          </div>
          <div style={{ display:'flex',gap:10 }}>
            <Button onClick={save} loading={saving} style={{ display:'flex',alignItems:'center',gap:6 }}><Save size={13}/> Save</Button>
            <Button variant="ghost" onClick={()=>setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {loading?<div style={{ display:'flex',justifyContent:'center',padding:40 }}><Spinner/></div>:(
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {records.length===0?<div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--gray-200)',padding:40,textAlign:'center',color:'var(--gray-400)',fontSize:13 }}>No records yet</div>
          :records.map(r=>(
            <div key={r.id} style={{ background:r.status==='urgent'?'#FFF7F7':'#fff',border:`1px solid ${r.status==='urgent'?'#FECACA':'var(--gray-200)'}`,borderRadius:10,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:4 }}>
                  <span style={{ fontWeight:700,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{r.title}</span>
                  <Badge color={TC[r.record_type]||'gray'} style={{ fontSize:10 }}>{r.record_type?.replace('_',' ')}</Badge>
                  <Badge color={SC[r.status]||'gray'} style={{ fontSize:10 }}>{r.status}</Badge>
                </div>
                {r.patient_name&&<div style={{ fontSize:12,color:'var(--gray-500)',marginBottom:4 }}>Patient: {r.patient_name}</div>}
                {r.description&&<div style={{ fontSize:13,color:'var(--gray-600)',lineHeight:1.5 }}>{r.description}</div>}
              </div>
              <div style={{ fontSize:11,color:'var(--gray-400)',whiteSpace:'nowrap',marginLeft:16,marginTop:2 }}>{new Date(r.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AlertsPanel = ({ doctorId }) => {
  const [alerts,setAlerts]=useState([]); const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{setLoading(true);const{data}=await supabase.from('alerts').select('*').eq('doctor_id',doctorId).order('created_at',{ascending:false});setAlerts(data||[]);setLoading(false);},[doctorId]);
  useEffect(()=>{load();},[load]);
  const markRead=async(id)=>{await supabase.from('alerts').update({is_read:true}).eq('id',id);load();};
  return(
    <div style={{ padding:28 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <h2 style={{ fontSize:20,fontWeight:800,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Alerts</h2>
        {alerts.filter(a=>!a.is_read).length>0&&<Badge color="red">{alerts.filter(a=>!a.is_read).length} unread</Badge>}
      </div>
      {loading?<div style={{ display:'flex',justifyContent:'center',padding:40 }}><Spinner/></div>:(
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          {alerts.length===0?<div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--gray-200)',padding:40,textAlign:'center',color:'var(--gray-400)',fontSize:13 }}>No alerts</div>
          :alerts.map(a=>(
            <div key={a.id} style={{ background:a.is_urgent&&!a.is_read?'#FFF7F7':'#fff',border:`1px solid ${a.is_urgent&&!a.is_read?'#FECACA':'var(--gray-200)'}`,borderRadius:10,padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',opacity:a.is_read?0.65:1 }}>
              <div style={{ display:'flex',gap:12,flex:1 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:a.is_urgent?'var(--red)':'var(--blue)',flexShrink:0,marginTop:4 }}/>
                <div>
                  <div style={{ fontWeight:a.is_read?400:700,fontSize:14,marginBottom:3 }}>{a.message}</div>
                  {a.patient_name&&<div style={{ fontSize:12,color:'var(--gray-500)' }}>Patient: {a.patient_name}</div>}
                  <div style={{ fontSize:11,color:'var(--gray-400)',marginTop:3 }}>{new Date(a.created_at).toLocaleString()}</div>
                </div>
              </div>
              {!a.is_read&&<button onClick={()=>markRead(a.id)} style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 12px',border:'1px solid var(--gray-200)',borderRadius:6,background:'#fff',cursor:'pointer',fontSize:12,color:'var(--gray-600)',flexShrink:0,marginLeft:12 }}><Check size={12}/> Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MessagesPanel = ({ userId }) => {
  const [msgs,setMsgs]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{supabase.from('messages').select('*, sender:sender_id(full_name), receiver:receiver_id(full_name)').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at',{ascending:false}).then(({data})=>{setMsgs(data||[]);setLoading(false);});},[userId]);
  return(
    <div style={{ padding:28 }}>
      <h2 style={{ fontSize:20,fontWeight:800,fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:20 }}>Messages</h2>
      {loading?<div style={{ display:'flex',justifyContent:'center',padding:40 }}><Spinner/></div>:(
        msgs.length===0?<div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--gray-200)',padding:48,textAlign:'center',color:'var(--gray-400)' }}><MessageSquare size={32} style={{ margin:'0 auto 12px',opacity:.3 }}/><div style={{ fontSize:14 }}>No messages yet</div></div>
        :<div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--gray-200)',overflow:'hidden' }}>
          {msgs.map((m,i)=>(
            <div key={m.id} style={{ padding:'13px 20px',borderBottom:i<msgs.length-1?'1px solid var(--gray-50)':'none',display:'flex',justifyContent:'space-between',alignItems:'center',background:!m.is_read&&m.receiver_id===userId?'var(--blue-pale)':'#fff' }}>
              <div>
                <div style={{ fontWeight:600,fontSize:14 }}>{m.subject||'(No subject)'}</div>
                <div style={{ fontSize:12,color:'var(--gray-500)',marginTop:2 }}>{m.sender?.full_name||'Unknown'} → {m.receiver?.full_name||'Unknown'}</div>
              </div>
              <div style={{ fontSize:11,color:'var(--gray-400)' }}>{new Date(m.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePanel = ({ profile, user }) => {
  const { toast }=useToast();
  const [form,setForm]=useState({ full_name:profile?.full_name||'',phone:profile?.phone||'',specialization:profile?.specialization||'',license_number:profile?.license_number||'' });
  const [saving,setSaving]=useState(false);
  const save=async()=>{setSaving(true);const{error}=await supabase.from('profiles').update(form).eq('id',user.id);if(error)toast(error.message,'error');else toast('Profile updated','success');setSaving(false);};
  const initials=(form.full_name||'D').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  return(
    <div style={{ padding:28,maxWidth:580 }}>
      <h2 style={{ fontSize:20,fontWeight:800,fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:24 }}>My Profile</h2>
      <div style={{ background:'#fff',borderRadius:12,border:'1px solid var(--gray-200)',padding:28 }}>
        <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:26,paddingBottom:22,borderBottom:'1px solid var(--gray-100)' }}>
          <div style={{ width:56,height:56,borderRadius:'50%',background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#fff',fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{initials}</div>
          <div>
            <div style={{ fontWeight:800,fontSize:17,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{form.full_name||'—'}</div>
            <div style={{ fontSize:13,color:'var(--gray-500)',marginTop:2 }}>{user?.email}</div>
            <Badge color="blue" style={{ marginTop:6,fontSize:11 }}>{profile?.role==='hospital_admin'?'Hospital Admin':'Doctor'}</Badge>
          </div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16 }}>
          <Input label="Full Name"      value={form.full_name}      onChange={e=>setForm(p=>({...p,full_name:e.target.value}))}/>
          <Input label="Phone"          value={form.phone}          onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+256 700 000 000"/>
          <Input label="Specialization" value={form.specialization} onChange={e=>setForm(p=>({...p,specialization:e.target.value}))} placeholder="e.g. Hematology"/>
          <Input label="License No."    value={form.license_number} onChange={e=>setForm(p=>({...p,license_number:e.target.value}))} placeholder="Medical council no."/>
        </div>
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13,fontWeight:600,color:'var(--gray-500)',display:'block',marginBottom:4 }}>Email (read-only)</label>
          <div style={{ padding:'10px 14px',background:'var(--gray-50)',border:'1.5px solid var(--gray-200)',borderRadius:6,fontSize:14,color:'var(--gray-500)' }}>{user?.email}</div>
        </div>
        <Button onClick={save} loading={saving} style={{ display:'flex',alignItems:'center',gap:6 }}><Save size={13}/> Save Changes</Button>
      </div>
    </div>
  );
};

export const DoctorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [active,       setActive]       = useState('dashboard');
  const [facility,     setFacility]     = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records,      setRecords]      = useState([]);
  const [alerts,       setAlerts]       = useState([]);

  useEffect(() => { if (!loading && !user) navigate('/doctor/login'); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      supabase.from('appointments').select('*').eq('doctor_id', user.id).order('scheduled_at'),
      supabase.from('patient_records').select('*').eq('doctor_id', user.id).order('created_at', { ascending: false }),
      supabase.from('alerts').select('*').eq('doctor_id', user.id).order('created_at', { ascending: false }),
    ]).then(([a, r, al]) => { setAppointments(a.data||[]); setRecords(r.data||[]); setAlerts(al.data||[]); });
  }, [user?.id]);

  useEffect(() => {
    if (profile?.facility_id) getFacilityById(profile.facility_id).then(({ data }) => setFacility(data));
  }, [profile?.facility_id]);

  const handleSignOut = async () => { await signOut(); navigate('/doctor/login'); };
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh' }}><Spinner size={36}/></div>;

  const urgentCount = alerts.filter(a => a.is_urgent && !a.is_read).length;
  const PANELS = {
    dashboard:    <DashboardHome profile={profile} facility={facility} appointments={appointments} records={records} alerts={alerts}/>,
    appointments: <AppointmentsPanel doctorId={user?.id} facilityId={profile?.facility_id}/>,
    records:      <RecordsPanel doctorId={user?.id} facilityId={profile?.facility_id}/>,
    alerts:       <AlertsPanel doctorId={user?.id}/>,
    messages:     <MessagesPanel userId={user?.id}/>,
    profile:      <ProfilePanel profile={profile} user={user}/>,
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--gray-50)' }}>
      <Sidebar active={active} setActive={setActive} profile={profile} onSignOut={handleSignOut}/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <TopBar title={NAV.find(n=>n.key===active)?.label||'Dashboard'} subtitle={facility?.name} urgentCount={urgentCount}/>
        <div style={{ flex:1, overflowY:'auto' }}>{PANELS[active]}</div>
      </div>
    </div>
  );
};
