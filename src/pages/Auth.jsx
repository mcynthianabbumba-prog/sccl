// src/pages/Auth.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Shield, Zap } from 'lucide-react';
import { signIn, signUp, resetPassword } from '../lib/supabase';
import { Button, Input } from '../components/ui';

// ─── Shared brand panel ───────────────────────────────────────────────────────
const BrandPanel = () => (
  <div style={{
    flex: '0 0 45%', background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)',
    padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  }}>
    {/* Background circles */}
    <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(29,78,216,.06)', top: -80, left: -80 }} />
    <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(29,78,216,.06)', bottom: 40, right: -40 }} />

    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
        <div style={{ width: 36, height: 36, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" fill="white"/>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--gray-900)' }}>SCCL Platform</span>
      </div>

      <h2 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: 'var(--gray-900)' }}>
        Connect to your <span style={{ color: 'var(--blue)' }}>Digital Future</span>
      </h2>
      <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 40 }}>
        Join thousands of professionals securing their workflow with SCCL's enterprise-grade platform.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { icon: Shield, title: 'Encrypted', desc: 'End-to-end data security' },
          { icon: Zap, title: 'Fast Access', desc: 'Optimized performance' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '14px 16px', backdropFilter: 'blur(4px)' }}>
            <Icon size={18} color="var(--blue)" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", color: 'var(--gray-800)' }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
export const Login = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await signIn({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: 'var(--gray-50)' }}>
      <BrandPanel />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, marginBottom: 6 }}>Welcome to my SCCL</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 28 }}>Securely access your SCCL platform account</p>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 8, padding: 4, marginBottom: 28 }}>
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: tab === t ? '#fff' : 'transparent',
                  fontWeight: tab === t ? 600 : 400, fontSize: 14,
                  color: tab === t ? 'var(--blue)' : 'var(--gray-500)',
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', fontSize: 13, padding: '10px 14px', borderRadius: 6 }}>{error}</div>}
              <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" icon={Mail} required />
              <div>
                <Input label="Password" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" icon={Lock} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', marginTop: -30, right: 12, background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: 'var(--blue)' }} />
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <Button type="submit" fullWidth loading={loading} size="lg">Sign In</Button>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', margin: '4px 0' }}>OR CONTINUE WITH</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" style={{ flex: 1, padding: '10px', border: '1.5px solid var(--gray-200)', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button type="button" style={{ flex: 1, padding: '10px', border: '1.5px solid var(--gray-200)', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  Apple
                </button>
              </div>
            </form>
          ) : (
            <SignUpForm navigate={navigate} />
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 20 }}>
            By continuing, you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--blue)', fontWeight: 600 }}>Terms of Service</Link>{' '}and{' '}
            <Link to="/privacy" style={{ color: 'var(--blue)', fontWeight: 600 }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Sign Up Form (embedded) ──────────────────────────────────────────────────
const SignUpForm = ({ navigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please agree to the terms'); return; }
    setLoading(true); setError('');
    const { error: err } = await signUp({ fullName, email, password });
    if (err) { setError(err.message); setLoading(false); }
    else setSuccess(true);
  };

  if (success) return (
    <div style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
      <h3 style={{ marginBottom: 8 }}>Check your email</h3>
      <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>We sent a confirmation link to <strong>{email}</strong></p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', fontSize: 13, padding: '10px 14px', borderRadius: 6 }}>{error}</div>}
      <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" icon={User} required />
      <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" icon={Mail} required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        <Input label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 13 }}>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--blue)' }} />
        I agree to the <Link to="/terms" style={{ color: 'var(--blue)', fontWeight: 600 }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--blue)', fontWeight: 600 }}>Privacy Policy</Link>.
      </label>
      <Button type="submit" fullWidth loading={loading} size="lg">Sign Up</Button>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-500)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>Log In</Link>
      </p>
    </form>
  );
};

// ─── Forgot Password Page ─────────────────────────────────────────────────────
export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await resetPassword(email);
    if (err) { setError(err.message); setLoading(false); }
    else setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'absolute', top: 20, left: 24 }}>
        <div style={{ width: 32, height: 32, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16 }}>SCCL</span>
      </div>

      <div style={{ background: 'var(--blue-pale)', borderRadius: 'var(--radius-lg)', padding: 32, maxWidth: 480, width: '100%', marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 56, height: 56, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="var(--blue)"/><path d="M18 8l-6 6-6-6" stroke="var(--blue)" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: 36, maxWidth: 480, width: '100%', boxShadow: 'var(--shadow)', marginTop: -24 }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <h3 style={{ marginBottom: 8 }}>Check your email</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>We sent a password reset link to <strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>Forgot password?</h2>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.6 }}>
              Don't worry, it happens. Enter your email address below and we'll send you a secure link to reset your account credentials.
            </p>
            {error && <div style={{ background: 'var(--red-light)', color: 'var(--red)', fontSize: 13, padding: '10px 14px', borderRadius: 6, marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" icon={Mail} required />
              <Button type="submit" fullWidth loading={loading} size="lg">Send reset link</Button>
            </form>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', fontSize: 14, color: 'var(--blue)', fontWeight: 600, marginTop: 16 }}>← Return to login page</Link>
          </>
        )}
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 20 }}>
        {['Privacy Policy', 'Terms of Service', 'Help Center'].map(t => (
          <Link key={t} to="#" style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t}</Link>
        ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>© 2024 SCCL Platform. All rights reserved.</p>
    </div>
  );
};
