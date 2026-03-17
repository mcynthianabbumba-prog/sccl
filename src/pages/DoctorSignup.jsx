// src/pages/DoctorSignup.jsx
// Accessible via: /doctor/signup?token=<invitation_token>
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { validateInvitationToken, doctorSignUpWithToken } from '../lib/supabase';
import { Input, Button, Spinner } from '../components/ui';

export const DoctorSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError,   setTokenError]   = useState('');

  const [fullName,  setFullName]  = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  // Validate token on load
  useEffect(() => {
    if (!token) {
      setTokenError('No invitation token found. Please use the link sent to you by your facility administrator.');
      setTokenLoading(false);
      return;
    }
    validateInvitationToken(token).then(({ data, error: err }) => {
      if (err || !data) {
        setTokenError('This invitation link is invalid, expired, or has already been used.');
      } else {
        setInvitation(data);
      }
      setTokenLoading(false);
    });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim())   { setError('Please enter your full name.'); return; }
    if (password.length < 8){ setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm){ setError('Passwords do not match.'); return; }

    setLoading(true); setError('');
    const { error: err } = await doctorSignUpWithToken({
      email:      invitation.email,
      password,
      fullName,
      token,
      facilityId: invitation.facility_id,
    });
    if (err) { setError(err.message); setLoading(false); }
    else     { setSuccess(true); setTimeout(() => navigate('/doctor/login'), 3000); }
  };

  // ── Token loading ──
  if (tokenLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <Spinner size={36} />
    </div>
  );

  // ── Invalid token ──
  if (tokenError) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
        <div style={{ width: 60, height: 60, background: 'var(--red-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <AlertTriangle size={28} color="var(--red)" />
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>Invalid Invitation</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 24 }}>{tokenError}</p>
        <Link to="/doctor/login">
          <Button fullWidth>Go to Login</Button>
        </Link>
      </div>
    </div>
  );

  // ── Success ──
  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
        <CheckCircle size={52} color="var(--green)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>Account created!</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 }}>
          Welcome to SCCL, <strong>{fullName}</strong>.<br />
          Redirecting you to the login page…
        </p>
      </div>
    </div>
  );

  // ── Signup form ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 17, color: 'var(--gray-900)' }}>SCCL Platform</span>
          </Link>

          {/* Facility badge */}
          {invitation?.facilities?.name && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-pale)', color: 'var(--blue)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              🏥 {invitation.facilities.name}
            </div>
          )}

          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Create Your Doctor Account</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 }}>
            You've been invited as a healthcare provider.<br />
            Your email: <strong style={{ color: 'var(--gray-700)' }}>{invitation?.email}</strong>
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: 'var(--shadow)' }}>
          {error && (
            <div style={{ background: 'var(--red-light)', color: 'var(--red)', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 20, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Jane Doe" icon={User} required />

            {/* Email — pre-filled, read-only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, background: 'var(--gray-50)', fontSize: 14, color: 'var(--gray-500)' }}>
                <Mail size={15} color="var(--gray-400)" />
                {invitation?.email}
                <CheckCircle size={14} color="var(--green)" style={{ marginLeft: 'auto' }} />
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Input
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                icon={Lock}
                required
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: 34, background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {password.length > 0 && (
              <div style={{ marginTop: -8 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4].map(i => {
                    const str = Math.min(4, Math.floor(password.length / 3));
                    return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= str ? (str <= 1 ? 'var(--red)' : str <= 2 ? 'var(--yellow)' : 'var(--green)') : 'var(--gray-200)', transition: 'background .2s' }} />;
                  })}
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              icon={Lock}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/doctor/login" style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            Already have an account? <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
