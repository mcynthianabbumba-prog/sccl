// src/pages/MapView.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Building2 } from 'lucide-react';
import { getFacilities } from '../lib/supabase';
import { Badge, Button, Spinner } from '../components/ui';
import 'leaflet/dist/leaflet.css';
import { useGeolocation } from '../hooks/useGeolocation';

// Fix leaflet default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const FlyToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => { if (coords) map.flyTo(coords, 14, { animate: true, duration: 1 }); }, [coords, map]);
  return null;
};

const MUKONO_CENTER = [0.3536, 32.7564];

const FilterBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 14px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: "'Plus Jakarta Sans',sans-serif",
      background: active ? 'var(--blue)' : '#fff',
      color: active ? '#fff' : 'var(--gray-600)',
      borderColor: active ? 'var(--blue)' : 'var(--gray-200)',
      transition: 'all 0.15s',
    }}
  >
    {label}
  </button>
);

export const MapView = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getFacilities().then(({ data }) => {
      setFacilities(data || []);
      setLoading(false);
    });
  }, []);

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => alert('Could not access your location'),
    );
  };

  const filtered = facilities.filter(f => {
    if (filter === 'general') return f.facility_type === 'public';
    if (filter === 'diagnostic') return f.has_diagnosis;
    return true;
  });

  // Compute km distance from Mukono centre (approx)
  const distance = (f) => {
    if (!f.latitude || !f.longitude) return null;
    const R = 6371;
    const dLat = ((f.latitude - MUKONO_CENTER[0]) * Math.PI) / 180;
    const dLon = ((f.longitude - MUKONO_CENTER[1]) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(MUKONO_CENTER[0] * Math.PI / 180) * Math.cos(f.latitude * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 61px)' }}>
      {/* Sidebar */}
      <div style={{ width: 320, background: '#fff', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: 17, marginBottom: 2 }}>Mukono Health</h2>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Mukono District Central</div>
            </div>
            <button onClick={handleLocate} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Navigation size={13} /> USE MY LOCATION
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['all', 'All Facilities'], ['general', '⊕ General'], ['diagnostic', '⊕ Diagnostic']].map(([v, l]) => (
              <FilterBtn key={v} label={l} active={filter === v} onClick={() => setFilter(v)} />
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
          ) : (
            filtered.map(f => (
              <div
                key={f.id}
                onClick={() => setSelected(f)}
                style={{
                  padding: '16px', borderBottom: '1px solid var(--gray-50)', cursor: 'pointer',
                  background: selected?.id === f.id ? 'var(--blue-pale)' : '#fff',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: selected?.id === f.id ? 'var(--blue)' : 'var(--gray-900)', flex: 1, paddingRight: 8 }}>{f.name}</h3>
                  {distance(f) && <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>{distance(f)} km</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>{f.address}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {f.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} color="gray" style={{ fontSize: 11 }}>{tag}</Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Legend */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, background: '#fff', borderRadius: 8, padding: '8px 14px', boxShadow: 'var(--shadow)', display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} /> General Care
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} /> Diagnostic
          </div>
        </div>

        <MapContainer center={MUKONO_CENTER} zoom={12} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userLocation && <FlyToLocation coords={userLocation} />}
          {selected?.latitude && <FlyToLocation coords={[selected.latitude, selected.longitude]} />}

          {filtered.filter(f => f.latitude && f.longitude).map(f => (
            <Marker
              key={f.id}
              position={[f.latitude, f.longitude]}
              icon={f.has_diagnosis ? greenIcon : blueIcon}
              eventHandlers={{ click: () => setSelected(f) }}
            >
              <Popup>
                <div style={{ minWidth: 200, fontFamily: 'inherit' }}>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 4 }}>{f.name}</h4>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>{f.address}</div>
                  {f.phone && <div style={{ fontSize: 12, marginBottom: 8 }}>📞 {f.phone}</div>}
                  <button
                    onClick={() => navigate(`/facility/${f.id}`)}
                    style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                  >
                    View Profile
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
