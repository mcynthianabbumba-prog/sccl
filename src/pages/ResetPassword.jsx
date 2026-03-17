// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button, Input } from '../components/ui';

export const ResetPassword = () => {
  const navigate   = useNavigate();
  const [password, setPassword]   = useState('');
  const [confirm,  setConfirm]    = useState('');
  const [showPwd,  setShowPwd]    = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the access token in the URL hash after the reset link is clicked
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm)  { setError('Passwords do not match.'); return; }

    setLoading(true); setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); }
    else     { setSuccess(true); setTimeout(() => navigate('/'), 3000); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: 40, maxWidth: 420, width: '100%', boxShadow: 'var(--shadow)' }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--green)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Password updated!</h2>
            <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Redirecting you to the home page…</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} color="#fff" />
              </div>
              <h2 style={{ fontSize: 20 }}>Set new password</h2>
            </div>

            {!sessionReady && (
              <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#92400E' }}>
                ⚠️ Open this page from the reset link in your email to proceed.
              </div>
            )}

            {error && (
              <div style={{ background: 'var(--red-light)', color: 'var(--red)', fontSize: 13, padding: '10px 14px', borderRadius: 6, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <Input
                  label="New Password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  icon={Lock}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: 32, background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                icon={Lock}
                required
              />

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => {
                      const strength = Math.min(4, Math.floor(password.length / 3));
                      return (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength
                            ? strength <= 1 ? 'var(--red)'
                            : strength <= 2 ? 'var(--yellow)'
                            : 'var(--green)'
                            : 'var(--gray-200)',
                          transition: 'background 0.2s',
                        }} />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {password.length < 6 ? 'Too short' : password.length < 9 ? 'Fair' : password.length < 12 ? 'Good' : 'Strong'}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={!sessionReady}
              >
                Update Password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
