// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Mail, Shield, Bell, LogOut, ChevronRight, Camera, Save } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase, signOut } from '../lib/supabase';
import { Button, Input, Card } from '../components/ui';
import { useToast } from '../components/ui/Toast';

const Section = ({ title, children }) => (
  <Card style={{ marginBottom: 20 }}>
    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-100)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h3>
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </Card>
);

const MenuItem = ({ icon: Icon, label, sub, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0', background: 'none', border: 'none',
      borderBottom: '1px solid var(--gray-50)', cursor: 'pointer',
      textAlign: 'left',
    }}
  >
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: danger ? 'var(--red-light)' : 'var(--blue-pale)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={16} color={danger ? 'var(--red)' : 'var(--blue)'} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: danger ? 'var(--red)' : 'var(--gray-800)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>{sub}</div>}
    </div>
    <ChevronRight size={15} color="var(--gray-300)" />
  </button>
);

export const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [saving, setSaving]     = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });

  useEffect(() => {
    if (user) setFullName(user.user_metadata?.full_name || '');
  }, [user]);

  if (loading) return null;
  if (!user)   return <Navigate to="/login" replace />;

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (error) toast(error.message, 'error');
    else       toast('Profile updated successfully', 'success');
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 60px' }}>
      <h1 style={{ fontSize: 26, marginBottom: 28 }}>My Profile</h1>

      {/* Avatar + name hero */}
      <Card style={{ padding: 28, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff',
            fontFamily: "'Plus Jakarta Sans',sans-serif", margin: '0 auto',
          }}>
            {initials}
          </div>
          <button style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--blue)', border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Camera size={12} color="#fff" />
          </button>
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>{fullName || 'Your Name'}</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>{user.email}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'var(--green-light)', padding: '4px 12px', borderRadius: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>Active Account</span>
        </div>
      </Card>

      {/* Edit profile */}
      <Section title="Personal Information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            icon={User}
            placeholder="Your full name"
          />
          <Input
            label="Email Address"
            value={user.email}
            icon={Mail}
            disabled
            style={{ opacity: 0.7 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleSaveProfile} loading={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={14} /> Save Changes
            </Button>
          </div>
        </div>
      </Section>

      {/* Notification prefs */}
      <Section title="Notification Preferences">
        {[
          { key: 'email', label: 'Email notifications', sub: 'Facility updates, new resources' },
          { key: 'sms',   label: 'SMS alerts',          sub: 'Emergency and urgent care alerts' },
          { key: 'push',  label: 'Push notifications',  sub: 'In-app alerts and reminders' },
        ].map(({ key, label, sub }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-50)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{sub}</div>
            </div>
            <button
              onClick={() => setNotifications(p => ({ ...p, [key]: !p[key] }))}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: notifications[key] ? 'var(--blue)' : 'var(--gray-200)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3,
                left: notifications[key] ? 23 : 3,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
              }} />
            </button>
          </div>
        ))}
      </Section>

      {/* Account actions */}
      <Section title="Account">
        <MenuItem icon={Shield}  label="Change Password"   sub="Update your account password" onClick={() => window.location.href = '/forgot-password'} />
        <MenuItem icon={Bell}    label="Saved Facilities"  sub="Facilities you've bookmarked" onClick={() => {}} />
        <MenuItem icon={LogOut}  label="Sign Out"          sub="Sign out of your account"     onClick={handleSignOut} danger />
      </Section>

      {/* App version */}
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
        SCCL Platform v1.0.0 · Mukono District, Uganda
      </div>
    </div>
  );
};
