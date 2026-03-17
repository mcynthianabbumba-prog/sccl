import { useState, useEffect } from 'react'
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, Bell, MessageSquare,
  Settings, LogOut, Activity, Search, Menu, X, ChevronRight,
  Plus, Download, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Button, Card, Badge, StatCard, Spinner } from '../../components/ui'
import { Sun, Moon } from 'lucide-react'

// ============================================================
// DOCTOR PORTAL LAYOUT
// ============================================================
export function DoctorLayout({ children }) {
  const { user, profile, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/doctor/patients', label: 'Patients', icon: Users },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/alerts', label: 'Alerts', icon: Bell },
    { to: '/doctor/messages', label: 'Messages', icon: MessageSquare },
    { to: '/doctor/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (item) => item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to) && item.to !== '/doctor'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)', flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : undefined,
        height: '100vh', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }} className="doctor-sidebar">
        {/* Logo */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, var(--blue-600), var(--accent-secondary))',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', lineHeight: 1 }}>SCCL</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>DOCTOR PORTAL</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
          }}>
            <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder="Search patients, records..."
              style={{
                border: 'none', background: 'none', outline: 'none',
                fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive({ to, exact })
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  textDecoration: 'none', marginBottom: '2px',
                  background: active ? 'var(--blue-50)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500, fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  borderLeft: active ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '14px', flexShrink: 0,
            }}>
              {profile?.full_name?.[0]?.toUpperCase() || 'D'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || 'Doctor'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cardiologist</p>
            </div>
            <button
              onClick={() => { signOut(); navigate('/') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
          className="mobile-overlay"
        />
      )}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }} className="doctor-main">
        {/* Top bar */}
        <header style={{
          height: 'var(--nav-height)', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: '12px',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'none', alignItems: 'center', color: 'var(--text-secondary)', padding: '4px',
            }}
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '360px',
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                placeholder="Search patients, records or dates..."
                style={{
                  border: 'none', background: 'none', outline: 'none',
                  fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                  flex: 1,
                }}
              />
            </div>
          </div>
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '6px' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '6px' }}>
            <Bell size={16} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '6px' }}>
            <span style={{ fontSize: '16px' }}>❓</span>
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '28px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .doctor-sidebar { transform: translateX(-100%); position: fixed; }
          .doctor-sidebar.open { transform: translateX(0); }
          .doctor-main { margin-left: 0 !important; }
          .sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

// ============================================================
// DOCTOR DASHBOARD
// ============================================================
export default function DoctorDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ patients: 0, appointments: 0, alerts: 0 })
  const [activity, setActivity] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    // In a real app, fetch actual data from doctor's hospital
    // Using mock data here for demo since no real patients are seeded
    setStats({ patients: 1284, appointments: 12, alerts: 3 })
    setActivity([
      { id: 1, icon: '✅', type: 'Lab Results Uploaded', desc: 'Patient Sarah Jenkins blood test results are ready for review.', time: '15 MINUTES AGO', urgent: false },
      { id: 2, icon: '💊', type: 'Prescription Refill', desc: 'Dr. Smith authorized a refill for Robert Wilson\'s medication.', time: '1 HOUR AGO', urgent: false },
      { id: 3, icon: '🚨', type: 'Emergency Consultation', desc: 'New emergency triage request from Michael Chen.', time: '3 HOURS AGO', urgent: true },
    ])
    setAppointments([
      { id: 1, time: '09:30', name: 'Alice Cooper', type: 'Follow-Up Checkup' },
      { id: 2, time: '10:15', name: 'David Miller', type: 'Routine Physical' },
      { id: 3, time: '11:00', name: 'John Doe', type: 'Diagnostic Test' },
    ])
    setLoading(false)
  }, [user])

  return (
    <DoctorLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Doctor'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Here's an overview of your practice for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" size="sm" icon={<Download size={14} />}>Export Report</Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>New Appointment</Button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }} className="stats-3">
          <StatCard icon={<Users size={22} />} label="Total Patients" value={stats.patients.toLocaleString()} change="12% this month" changeType="positive" color="blue" />
          <StatCard icon={<Calendar size={22} />} label="Upcoming Appointments" value={stats.appointments} change="5% from last week" changeType="positive" color="blue" />
          <div>
            <Card style={{ border: stats.alerts > 0 ? '1px solid #fecaca' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>Emergency Alerts</p>
                  <p style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stats.alerts}</p>
                  {stats.alerts > 0 && (
                    <Badge variant="danger" size="sm" style={{ marginTop: '8px' }}>Action Required</Badge>
                  )}
                </div>
                <div style={{ background: '#fee2e2', borderRadius: 'var(--radius-md)', padding: '10px', color: '#dc2626' }}>
                  <AlertTriangle size={22} />
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }} className="dashboard-grid">
          {/* Recent Activity */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>Recent Activity</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                View All
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activity.map(a => (
                <div key={a.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: a.urgent ? '#fee2e2' : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{a.type}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{a.desc}</p>
                    {a.urgent && (
                      <Badge variant="danger" size="sm">Urgent Review</Badge>
                    )}
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: a.urgent ? '6px' : 0 }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Daily Review */}
            <div style={{
              background: 'var(--accent-primary)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
                Daily Review
              </h4>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '16px', lineHeight: 1.6 }}>
                You have 4 patient records pending review today.
              </p>
              <button style={{
                width: '100%', padding: '10px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 'var(--radius-md)', color: 'white',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}>
                Start Review
              </button>
            </div>

            {/* Next Appointments */}
            <Card>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                Next Appointments
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.map(apt => (
                  <div key={apt.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--accent-primary)', minWidth: '36px' }}>
                      {apt.time}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '13px' }}>{apt.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{apt.type}</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
              <button style={{
                width: '100%', marginTop: '12px', padding: '10px',
                background: 'none', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)',
                fontFamily: 'var(--font-body)',
              }}>
                View Schedule
              </button>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .stats-3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DoctorLayout>
  )
}
