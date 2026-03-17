// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, LogOut, ExternalLink, Stethoscope, Building2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getFacilityById, signOut } from '../lib/supabase';
import { Card, Badge, Spinner } from '../components/ui';

export const DoctorDashboard = () => {
  const { user, profile, isDoctor, isHospitalAdmin, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [facLoading, setFacLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isDoctor && !isHospitalAdmin && !isSuperAdmin) {
      navigate('/doctor/login');
    }
  }, [loading, isDoctor, isHospitalAdmin, isSuperAdmin, navigate]);

  useEffect(() => {
    if (profile?.facility_id) {
      getFacilityById(profile.facility_id).then(({ data }) => {
        setFacility(data);
        setFacLoading(false);
      });
    } else {
      setFacLoading(false);
    }
  }, [profile]);

  const handleSignOut = async () => { await signOut(); navigate('/doctor/login'); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={36} /></div>;

  const name = profile?.full_name || user?.user_metadata?.full_name || 'Doctor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--blue)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16 }}>SCCL</span>
          <span style={{ fontSize: 13, color: 'var(--gray-400)', marginLeft: 4 }}>/ Staff Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <ExternalLink size={13} /> Public site
          </Link>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {greeting}, {name.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 15, color: 'var(--gray-500)', marginTop: 6 }}>
            {new Date().toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Role badge */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <Badge color="blue">
            <Stethoscope size={11} style={{ display: 'inline', marginRight: 4 }} />
            {profile?.role === 'hospital_admin' ? 'Hospital Administrator' : 'Doctor'}
          </Badge>
          {facility && <Badge color="gray">{facility.name}</Badge>}
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { icon: MapPin, label: 'Facility Map',        sub: 'View all facilities',        to: '/map',       color: 'var(--blue)' },
            { icon: Phone,  label: 'Emergency Contacts',  sub: 'Crisis lines & triage',      to: '/emergency', color: 'var(--red)' },
            { icon: ExternalLink, label: 'Patient Resources', sub: 'SCD education hub',      to: '/education', color: 'var(--green)' },
          ].map(({ icon: Icon, label, sub, to, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <Card hover style={{ padding: 22, cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{sub}</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Facility info */}
        {facLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : facility ? (
          <Card style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={22} color="var(--blue)" />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>{facility.name}</h2>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{facility.address}</div>
                </div>
              </div>
              <Link to={`/facility/${facility.id}`}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)' }}>
                  <ExternalLink size={12} /> View public page
                </button>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {facility.sickle_cell_services?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>SCD Services</div>
                  {facility.sickle_cell_services.slice(0, 4).map(s => (
                    <div key={s} style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} /> {s}
                    </div>
                  ))}
                </div>
              )}
              {facility.phone && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Contact</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} color="var(--gray-400)" /> {facility.phone}
                  </div>
                </div>
              )}
              {facility.opening_hours && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Today's Hours</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} color="var(--gray-400)" />
                    {facility.opening_hours[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] || '—'}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)' }}>
            <Building2 size={36} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14 }}>No facility linked to your account yet.</div>
          </Card>
        )}
      </div>
    </div>
  );
};
