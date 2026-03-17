// src/pages/DoctorLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Stethoscope, ShieldCheck } from 'lucide-react';
import { signIn, supabase } from '../lib/supabase';
import { Input, Button } from '../components/ui';

export const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { data, error: err } = await signIn({ email, password });
    if (err) {
      setError('Invalid credentials. Contact your facility administrator if you need access.');
      setLoading(false);
      return;
    }

    // Fetch profile role and redirect accordingly
    const { data: prof } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();

    if (prof?.role === 'super_admin')    navigate('/admin/owner');
    else if (prof?.role === 'hospital_admin') navigate('/admin/hospital');
    else if (prof?.role === 'doctor')    navigate('/doctor/dashboard');
    else navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1D4ED8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {[{ s:400,t:-100,r:-100,o:.04 },{ s:300,b:-80,l:-80,o:.06 },{ s:200,t:'40%',l:'20%',o:.03 }].map((c,i) => (
        <div key={i} style={{
          position:'absolute',width:c.s,height:c.s,borderRadius:'50%',background:'#fff',
          opacity:c.o,top:c.t,bottom:c.b,left:c.l,right:c.r,pointerEvents:'none',
        }}/>
      ))}

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display:'inline-flex',alignItems:'center',gap:10,marginBottom:28,textDecoration:'none' }}>
            <div style={{ width:40,height:40,background:'rgba(255,255,255,.15)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill="white"/>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:18,color:'#fff' }}>SCCL Platform</span>
          </Link>
          <div style={{ width:52,height:52,background:'rgba(255,255,255,.12)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.2)',margin:'0 auto 14px' }}>
            <Stethoscope size={24} color="#fff"/>
          </div>
          <h1 style={{ color:'#fff',fontSize:26,fontWeight:800,marginBottom:8,fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Healthcare Staff Portal</h1>
          <p style={{ color:'rgba(255,255,255,.65)',fontSize:14,lineHeight:1.6 }}>
            Sign in with your facility-issued credentials.<br/>Access is restricted to authorised personnel only.
          </p>
        </div>

        <div style={{ background:'#fff',borderRadius:20,padding:36,boxShadow:'0 24px 64px rgba(0,0,0,.35)' }}>
          {error && (
            <div style={{ background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:8,padding:'12px 14px',marginBottom:20,fontSize:13,color:'#991B1B',lineHeight:1.5 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:18 }}>
            <Input label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@hospital.ug" icon={Mail} required/>
            <div style={{ position:'relative' }}>
              <Input label="Password" type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" icon={Lock} required/>
              <button type="button" onClick={()=>setShowPwd(v=>!v)} style={{ position:'absolute',right:12,top:34,background:'none',border:'none',color:'var(--gray-400)',cursor:'pointer' }}>
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            <div style={{ textAlign:'right' }}>
              <Link to="/forgot-password" style={{ fontSize:13,color:'var(--blue)',fontWeight:600 }}>Forgot password?</Link>
            </div>
            <Button type="submit" fullWidth size="lg" loading={loading}>Sign In to Portal</Button>
          </form>
          <div style={{ marginTop:24,paddingTop:20,borderTop:'1px solid var(--gray-100)',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
            <ShieldCheck size={14} color="var(--green)"/>
            <span style={{ fontSize:12,color:'var(--gray-500)' }}>Secured · Mukono District Health Network</span>
          </div>
        </div>
        <div style={{ textAlign:'center',marginTop:24 }}>
          <Link to="/" style={{ fontSize:13,color:'rgba(255,255,255,.6)',textDecoration:'none' }}>← Back to public site</Link>
        </div>
      </div>
    </div>
  );
};
