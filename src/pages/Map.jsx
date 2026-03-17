import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, List, Layers, Phone, CheckCircle, Navigation } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout/Layout'
import FacilityMap from '../components/map/FacilityMap'
import { Badge, Card, Button, Spinner } from '../components/ui'

export default function MapPage() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('map') // 'map' | 'list'

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('hospitals')
        .select('*, hospital_services(*)')
        .eq('is_active', true)
        .not('latitude', 'is', null)
      setHospitals(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = hospitals.filter(h => {
    if (filter === 'emergency') return h.emergency_available
    if (filter === 'diagnostic') return h.hospital_services?.some(s => ['sickle_cell_testing', 'lab_services', 'newborn_screening'].includes(s.service_type))
    return true
  })

  const selectedHospital = hospitals.find(h => h.id === selectedId)

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - var(--nav-height))' }}>

        {/* Left Panel */}
        <div style={{
          width: '340px', flexShrink: 0,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }} className="map-panel">

          {/* Panel Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>
              Mukono Health
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Mukono District Central
            </p>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { value: 'all', label: 'All Facilities' },
                { value: 'general', label: 'General' },
                { value: 'diagnostic', label: 'Diagnostic' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  style={{
                    padding: '5px 12px', borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: filter === value ? 'var(--accent-primary)' : 'transparent',
                    color: filter === value ? 'white' : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Facility List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Spinner size={24} color="var(--accent-primary)" />
              </div>
            ) : filtered.map(h => (
              <div
                key={h.id}
                onClick={() => setSelectedId(h.id === selectedId ? null : h.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: selectedId === h.id ? 'var(--blue-50)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                  borderLeft: selectedId === h.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                }}
                onMouseEnter={e => selectedId !== h.id && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={e => selectedId !== h.id && (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {h.name}
                      </h4>
                      {h.is_verified && <CheckCircle size={12} style={{ color: 'var(--accent-success)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {h.address || h.sub_county}
                    </p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {h.emergency_available && <Badge variant="danger" size="sm">Emergency</Badge>}
                      {h.hospital_services?.slice(0, 2).map(s => (
                        <Badge key={s.id} variant="primary" size="sm">
                          {s.service_type.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, flexShrink: 0, marginLeft: '8px' }}>
                    {/* Distance would be calculated with geolocation */}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Legend */}
          <div style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 10,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', gap: '14px', fontSize: '12px',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
              General Care
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-emergency)', display: 'inline-block' }} />
              Emergency
            </span>
          </div>

          {/* Selected hospital panel */}
          {selectedHospital && (
            <div style={{
              position: 'absolute', bottom: '20px', left: '20px', zIndex: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px', width: '280px',
              boxShadow: 'var(--shadow-xl)',
              animation: 'fadeIn 0.2s ease',
            }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                {selectedHospital.name}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} /> {selectedHospital.address || selectedHospital.sub_county}
              </p>
              {selectedHospital.phone && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={11} /> {selectedHospital.phone}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to={`/facility/${selectedHospital.slug || selectedHospital.id}`} style={{ flex: 1 }}>
                  <Button variant="primary" size="sm" fullWidth>View Profile</Button>
                </Link>
                {selectedHospital.phone && (
                  <a href={`tel:${selectedHospital.phone}`} style={{ flex: 1 }}>
                    <Button variant="outline" size="sm" fullWidth icon={<Phone size={12} />}>Call</Button>
                  </a>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-tertiary)',
            }}>
              <Spinner size={40} color="var(--accent-primary)" />
            </div>
          ) : (
            <FacilityMap
              hospitals={filtered}
              height="100%"
              zoom={12}
              onMarkerClick={h => setSelectedId(h.id)}
              selectedId={selectedId}
            />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .map-panel { display: none !important; }
        }
      `}</style>
    </Layout>
  )
}
