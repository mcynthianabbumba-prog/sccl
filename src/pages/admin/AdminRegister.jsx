import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Activity, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button, Input, Alert } from '../../components/ui'

export default function AdminRegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)

    // 1. Sign up the user
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: 'admin' } }
    })

    if (signUpErr) { setError(signUpErr.message); setLoading(false); return }

    // 2. Immediately upsert the profile with admin role
    // (the trigger may have already created it with 'patient', so we upsert)
    if (data?.user) {
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: form.email,
          full_name: form.fullName,
          role: 'admin',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (profileErr) {
        setError('Account created but failed to set admin role: ' + profileErr.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#dcfce7', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px',
          }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
            Admin account created!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
            <strong>{form.email}</strong> now has full admin access.
            You can sign in and go directly to the admin panel.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
              Sign In Now
            </Button>
            <Button variant="ghost" fullWidth onClick={() => {
              setSuccess(false)
              setForm({ fullName: '', email: '', password: '', confirmPassword: '' })
            }}>
              Create Another Admin
            </Button>
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
          Create Admin Account
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          This page is not publicly linked. Accounts created here get full admin access to{' '}
          <code style={{ background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: '4px', fontSize: '12px' }}>/sccl-admin</code>.
        </p>
      </div>

      {error && <Alert type="error" onClose={() => setError('')} style={{ marginBottom: '16px' }}>{error}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Full Name"
          value={form.fullName}
          onChange={update('fullName')}
          placeholder="Your name"
          icon={<User size={14} />}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={update('email')}
          placeholder="admin@sccl.ug"
          icon={<Mail size={14} />}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={update('password')}
          placeholder="••••••••"
          icon={<Lock size={14} />}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          placeholder="••••••••"
          required
        />

        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: 'var(--blue-50)', border: '1px solid var(--blue-200)',
          fontSize: '12px', color: 'var(--blue-700)', lineHeight: 1.6,
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          This account will be created with <strong>role: admin</strong> and can CRUD hospitals, approve doctors, and manage all platform data.
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
          Create Admin Account
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign In</Link>
        {' · '}
        <Link to="/sccl-admin" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Admin Panel</Link>
      </p>
    </PageShell>
  )
}

function PageShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '28px' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>
            SCCL Uganda
          </span>
        </Link>

        {/* Card */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)', padding: '28px 32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#fef3c7', border: '1px solid #fde68a',
            borderRadius: 'var(--radius-full)', padding: '4px 12px',
            fontSize: '11px', fontWeight: 700, color: '#b45309',
            letterSpacing: '0.04em', marginBottom: '20px',
          }}>
            <ShieldCheck size={11} /> ADMIN REGISTRATION
          </div>

          {children}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
          © 2026 SCCL Uganda · This page is not publicly accessible
        </p>
      </div>
    </div>
  )
}
