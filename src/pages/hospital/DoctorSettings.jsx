import { useState } from 'react'
import { Bell, Shield, Database, Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DoctorLayout } from './DoctorPortal'
import { Card, Button, Input, Badge, Checkbox, Alert } from '../../components/ui'

export default function DoctorSettings() {
  const { profile } = useAuth()
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({ email: true, push: true, sms: false })

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <DoctorLayout>
      <div style={{ maxWidth: '840px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '24px' }}>
          Account Settings
        </h1>

        {saved && <Alert type="success" style={{ marginBottom: '20px' }}>Settings saved successfully.</Alert>}

        {/* Profile Card */}
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800,
              }}>
                {profile?.full_name?.[0]?.toUpperCase() || 'D'}
              </div>
              <button style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--accent-primary)', border: '2px solid var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Camera size={12} color="white" />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
                {profile?.full_name || 'Dr. Smith'}
              </h2>
              <p style={{ color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600 }}>Senior Cardiologist</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                City Central Hospital · General Medicine Department
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="primary" size="sm">✏️ Edit Profile</Button>
              <Button variant="outline" size="sm">View Public Profile</Button>
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="settings-grid">
          {/* Notification Preferences */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} style={{ color: 'var(--accent-primary)' }} /> Notification Preferences
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Summary of daily appointments' },
                { key: 'push', label: 'Push Notifications', desc: 'Real-time patient check-in alerts' },
                { key: 'sms', label: 'SMS Alerts', desc: 'Critical updates & emergency messages' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: notifs[key] ? 'var(--blue-50)' : 'transparent',
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '13px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifs[key]}
                      onChange={() => setNotifs(n => ({ ...n, [key]: !n[key] }))}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', inset: 0,
                      background: notifs[key] ? 'var(--accent-primary)' : 'var(--border-strong)',
                      borderRadius: '10px',
                      transition: 'background 0.2s',
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: notifs[key] ? '18px' : '2px',
                        width: '16px', height: '16px',
                        borderRadius: '50%', background: 'white',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Account Security */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} style={{ color: 'var(--accent-primary)' }} /> Account Security
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Two-Factor Authentication', desc: 'Enabled · Secure mobile app', badge: 'Active', badgeColor: '#16a34a', badgeBg: '#dcfce7' },
                { label: 'Change Password', desc: 'Last updated 3 months ago', badge: null },
                { label: 'Login History', desc: 'View recent sign-in activity', badge: null },
              ].map(({ label, desc, badge, badgeColor, badgeBg }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)', cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '13px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</p>
                  </div>
                  {badge && (
                    <span style={{
                      background: badgeBg, color: badgeColor,
                      fontSize: '11px', fontWeight: 700,
                      padding: '3px 8px', borderRadius: 'var(--radius-full)',
                    }}>
                      {badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Privacy */}
        <Card style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Database size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '14px' }}>Privacy & Data Management</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Manage how your professional data is shared and used within SCCL.
            </p>
          </div>
          <Button variant="ghost" size="sm" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
            Manage Data
          </Button>
        </Card>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={save}>Save Changes</Button>
        </div>
      </div>

      <style>{`@media (max-width: 700px) { .settings-grid { grid-template-columns: 1fr !important; } }`}</style>
    </DoctorLayout>
  )
}
