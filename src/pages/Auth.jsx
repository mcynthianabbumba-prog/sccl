import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, User, Activity, ArrowRight, Eye } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Alert, Divider } from '../components/ui'

/* ============================================================
   LOGIN PAGE
   ============================================================ */
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate(from, { replace: true })
  }

  return (
    <AuthLayout
      title="Welcome to SCCL"
      subtitle="Securely access your SCCL platform account"
      side={<LoginSide />}
    >
      <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-tertiary)', marginBottom: '24px' }}>
        <button style={{
          flex: 1, padding: '10px', border: 'none', background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
          fontWeight: 600, fontSize: '14px', color: 'var(--accent-primary)', cursor: 'default',
          boxShadow: 'var(--shadow-sm)',
        }}>Login</button>
        <Link to="/signup" style={{
          flex: 1, padding: '10px', display: 'flex', justifyContent: 'center',
          textDecoration: 'none', fontFamily: 'var(--font-body)',
          fontWeight: 500, fontSize: '14px', color: 'var(--text-muted)',
        }}>Sign Up</Link>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: error ? '16px' : 0 }}>
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@example.com"
          icon={<Mail size={15} />}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock size={15} />}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        By continuing, you agree to our{' '}
        <a href="#" style={{ color: 'var(--accent-primary)' }}>Terms</a>
        {' '}and{' '}
        <a href="#" style={{ color: 'var(--accent-primary)' }}>Privacy Policy</a>.
      </p>
    </AuthLayout>
  )
}

/* ============================================================
   SIGNUP PAGE
   ============================================================ */
export function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (!agreed) return setError('You must agree to the Terms of Service.')

    setLoading(true)
    const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName, role: 'patient' })
    setLoading(false)

    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a confirmation link" side={<LoginSide />}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📧</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
            We sent a confirmation email to <strong>{form.email}</strong>. Click the link to activate your account.
          </p>
          <Button variant="outline" fullWidth onClick={() => navigate('/login')} style={{ marginTop: '24px' }}>
            Back to Login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Welcome to my SCCL"
      subtitle="Create your account to get started with the platform"
      side={<LoginSide />}
    >
      <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-tertiary)', marginBottom: '24px' }}>
        <Link to="/login" style={{
          flex: 1, padding: '10px', display: 'flex', justifyContent: 'center',
          textDecoration: 'none', fontFamily: 'var(--font-body)',
          fontWeight: 500, fontSize: '14px', color: 'var(--text-muted)',
        }}>Login</Link>
        <button style={{
          flex: 1, padding: '10px', border: 'none', background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
          fontWeight: 600, fontSize: '14px', color: 'var(--accent-primary)', cursor: 'default',
          boxShadow: 'var(--shadow-sm)',
        }}>Sign Up</button>
      </div>

      {error && <Alert type="error" onClose={() => setError('')} style={{ marginBottom: '16px' }}>{error}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input
          label="Full Name"
          value={form.fullName}
          onChange={update('fullName')}
          placeholder="Enter your full name"
          icon={<User size={15} />}
          required
        />
        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={update('email')}
          placeholder="name@company.com"
          icon={<Mail size={15} />}
          required
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="••••••••"
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
        </div>
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: '2px', accentColor: 'var(--accent-primary)' }}
          />
          I agree to the{' '}
          <a href="#" style={{ color: 'var(--accent-primary)' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color: 'var(--accent-primary)' }}>Privacy Policy</a>.
        </label>
        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
          Sign Up
        </Button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Log In</Link>
      </p>
    </AuthLayout>
  )
}

/* ============================================================
   FORGOT PASSWORD
   ============================================================ */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { supabase } = await import('../lib/supabase')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>
              SCCL
            </span>
          </Link>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Header gradient */}
          <div style={{
            height: '120px',
            background: 'linear-gradient(135deg, var(--blue-500), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
            }}>
              🔐
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
                  Check your email
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
                  We've sent a reset link to <strong>{email}</strong>.
                </p>
                <Button variant="outline" fullWidth onClick={() => navigate('/login')}>
                  ← Return to login page
                </Button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                  Forgot password?
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                  Don't worry, it happens. Enter your email address below and we'll send you a secure link to reset your account credentials.
                </p>
                {error && <Alert type="error" onClose={() => setError('')} style={{ marginBottom: '16px' }}>{error}</Alert>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    icon={<Mail size={15} />}
                    required
                  />
                  <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
                    Send reset link
                  </Button>
                  <Link to="/login" style={{
                    textAlign: 'center', fontSize: '13px',
                    color: 'var(--accent-primary)', fontWeight: 500,
                  }}>
                    ← Return to login page
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 SCCL Platform. All rights reserved.
        </p>
      </div>
    </div>
  )
}

/* ============================================================
   SHARED LAYOUT
   ============================================================ */
function AuthLayout({ title, subtitle, children, side }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left side */}
      <div style={{
        flex: '0 0 45%', background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
        padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }} className="auth-side">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '48px' }}>
          <div style={{
            width: 40, height: 40, background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--blue-900)' }}>
            SCCL Platform
          </span>
        </Link>
        {side}
      </div>

      {/* Right side */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', background: 'var(--bg-secondary)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>{subtitle}</p>
          {children}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .auth-side { display: none !important; } }`}</style>
    </div>
  )
}

function LoginSide() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: 'var(--blue-900)' }}>
        Connect to your{' '}
        <span style={{ color: 'var(--blue-600)' }}>Digital Future</span>
      </h2>
      <p style={{ color: 'var(--blue-700)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
        Join thousands of professionals securing their workflow with SCCL's enterprise-grade platform.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { icon: '🔒', title: 'Encrypted', desc: 'End-to-end data security' },
          { icon: '⚡', title: 'Fast Access', desc: 'Optimized performance' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 'var(--radius-lg)', padding: '16px',
            border: '1px solid rgba(255,255,255,0.8)',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--blue-900)', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: 'var(--blue-600)' }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
