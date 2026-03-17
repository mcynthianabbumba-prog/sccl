// src/pages/FacilityProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Phone, Navigation, Share2, Heart, Clock, MapPin, CheckCircle, Users, MessageCircle, Building2 } from 'lucide-react';
import { getFacilityById } from '../lib/supabase';
import { Badge, Button, Card, Spinner } from '../components/ui';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DAY_LABELS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday', emergency: 'Emergency Services' };

export const FacilityProfile = () => {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacilityById(id).then(({ data }) => {
      setFacility(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>;
  if (!facility) return <div style={{ textAlign: 'center', padding: 80 }}>Facility not found.</div>;

  const hasCoords = facility.latitude && facility.longitude;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
      {/* Hero image */}
      <div style={{ height: 240, background: 'var(--gray-200)', position: 'relative', marginLeft: -24, marginRight: -24, overflow: 'hidden' }}>
        {facility.image_url ? (
          <img src={facility.image_url} alt={facility.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={60} color="var(--gray-300)" />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
          <Badge color={facility.facility_type === 'public' ? 'blue' : 'gray'} style={{ marginBottom: 8 }}>
            {facility.facility_type === 'public' ? 'PUBLIC HEALTH FACILITY' : facility.facility_type?.toUpperCase()}
          </Badge>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>{facility.address}</div>
          <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800 }}>{facility.name}</h1>
        </div>
        <div style={{ position: 'absolute', bottom: 20, right: 24, display: 'flex', gap: 10 }}>
          {facility.phone && (
            <a href={`tel:${facility.phone}`}>
              <Button variant="primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} /> Call Now
              </Button>
            </a>
          )}
          {hasCoords && (
            <a href={`https://www.openstreetmap.org/directions?to=${facility.latitude},${facility.longitude}`} target="_blank" rel="noreferrer">
              <Button variant="secondary" style={{ background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Navigation size={14} /> Directions
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginTop: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Sickle Cell Services */}
          {facility.sickle_cell_services?.length > 0 && (
            <Card style={{ padding: 24 }}>
              <h2 style={{ fontSize: 17, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} color="var(--blue)" /> Sickle Cell Services
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {facility.sickle_cell_services.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <CheckCircle size={14} color="var(--blue)" /> {s}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Diagnosis */}
          {facility.diagnosis_services?.length > 0 && (
            <Card style={{ padding: 24 }}>
              <h2 style={{ fontSize: 17, marginBottom: 16 }}>Diagnosis & Lab Capabilities</h2>
              {facility.diagnosis_services.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < facility.diagnosis_services.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <CheckCircle size={12} color="var(--green)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Available at this facility</div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Specialists */}
          {facility.specialists?.length > 0 && (
            <Card style={{ padding: 24 }}>
              <h2 style={{ fontSize: 17, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="var(--blue)" /> Specialist Staffing & Clinics
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Specialist Role</div>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Clinic Schedule</div>
                {facility.specialists.map((s, i) => (
                  <React.Fragment key={s}>
                    <div style={{ padding: '10px 0', borderTop: i === 0 ? '1px solid var(--gray-100)' : 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>{s[0]}</div>
                      {s}
                    </div>
                    <div style={{ padding: '10px 0', borderTop: i === 0 ? '1px solid var(--gray-100)' : 'none', fontSize: 12, fontWeight: 700, color: 'var(--blue)', display: 'flex', alignItems: 'center' }}>
                      {i === 0 ? 'TUES & THURS' : i === 1 ? 'WED & FRI' : 'DAILY (MON–FRI)'}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hours */}
          {facility.opening_hours && (
            <Card style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={15} color="var(--blue)" /> Operating Hours
              </h3>
              {Object.entries(facility.opening_hours).map(([day, hours]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--gray-50)' }}>
                  <span style={{ color: day === 'emergency' ? 'var(--red)' : 'var(--gray-600)', fontWeight: day === 'emergency' ? 600 : 400 }}>
                    {DAY_LABELS[day] || day}
                  </span>
                  <span style={{ fontWeight: 600, color: day === 'emergency' ? 'var(--red)' : 'var(--gray-800)' }}>
                    {hours === '24/7' ? '24 Hours / 7 Days' : hours}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* Map */}
          {hasCoords && (
            <Card style={{ padding: 16 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={15} color="var(--blue)" /> Facility Location
              </h3>
              <div style={{ height: 200, borderRadius: 8, overflow: 'hidden' }}>
                <MapContainer center={[facility.latitude, facility.longitude]} zoom={15} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[facility.latitude, facility.longitude]}>
                    <Popup>{facility.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              {facility.address && (
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 10, lineHeight: 1.5 }}>
                  <strong>Detailed Address:</strong><br />{facility.address}
                </div>
              )}
            </Card>
          )}

          {/* Support */}
          <div style={{ background: 'var(--blue)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <h3 style={{ fontSize: 14, color: '#fff', marginBottom: 6 }}>Need Help?</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 16, lineHeight: 1.5 }}>
              Contact the SCCL support team for questions regarding services at this facility.
            </p>
            <Link to="/emergency">
              <button style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '10px', color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <MessageCircle size={14} /> Contact Support
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
