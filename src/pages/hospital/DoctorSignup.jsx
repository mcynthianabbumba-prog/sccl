import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Stethoscope, Building, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Select, Alert } from '../../components/ui'

export default function DoctorSignupPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    specialty: '', department: '', hospitalId: '',
  })
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('hospitals').select('id, name').eq('is_active', true).order('name')
      .then(({ data }) => setHospitals(data || []))
  }, [])

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (!form.hospitalId) return setError('Please select your hospital.')

    setLoading(true)
    const { data, error: signUpErr } = await signUp({
      email: form.email, password: form.password,
      fullName: form.fullName, role: 'doctor',
    })

    if (signUpErr) { setError(signUpErr.message); setLoading(false); return }

    // Create doctor record — will be linked when auth confirms
    if (data?.user) {
      await supabase.from('doctors').insert({
        profile_id: data.user.id,
        hospital_id: form.hospitalId,
        specialty: form.specialty,
        department: form.department,
        is_approved: false,
      })
    }

    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <DoctorAuthLayout>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
            Registration Submitted
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
            Your account is pending approval by SCCL administrators. You'll receive an email once approved. Please also check your inbox to confirm your email address.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
            Back to Sign In
          </Button>
        </div>
      </DoctorAuthLayout>
    )
  }

  return (
    <DoctorAuthLayout>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
        Doctor Registration
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Register as a healthcare provider on the SCCL platform.
      </p>

      {error && <Alert type="error" onClose={() => setError('')} style={{ marginBottom: '16px' }}>{error}</Alert>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Input label="Full Name *" value={form.fullName} onChange={update('fullName')} placeholder="Dr. Jane Smith" icon={<User size={14} />} required />
        <Input label="Email Address *" type="email" value={form.email} onChange={update('email')} placeholder="doctor@hospital.ug" icon={<Mail size={14} />} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Password *" type="password" value={form.password} onChange={update('password')} placeholder="••••••••" required />
          <Input label="Confirm Password *" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="••••••••" required />
        </div>
        <Select label="Hospital / Facility *" value={form.hospitalId} onChange={update('hospitalId')} required>
          <option value="">Select your hospital...</option>
          {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </Select>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Specialty" value={form.specialty} onChange={update('specialty')} placeholder="e.g. Hematology" icon={<Stethoscope size={14} />} />
          <Input label="Department" value={form.department} onChange={update('department')} placeholder="e.g. Pediatrics" icon={<Building size={14} />} />
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 'var(--radius-md)',
          background: 'var(--blue-50)', border: '1px solid var(--blue-200)',
          fontSize: '12px', color: 'var(--blue-700)', lineHeight: 1.6,
        }}>
          ℹ️ Your registration will be reviewed by SCCL administrators before you can access the doctor portal. This typically takes 24–48 hours.
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
          Submit Registration
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign In</Link>
      </p>
    </DoctorAuthLayout>
  )
}

function DoctorAuthLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '28px' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>SCCL Uganda</span>
        </Link>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)', padding: '32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {children}
        </div>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2026 SCCL Platform. All rights reserved.
        </p>
      </div>
    </div>
  )
}
