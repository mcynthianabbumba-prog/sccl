import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MapPin, Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'
import { Card, Button, Badge, Spinner } from '../components/ui'

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    async function load() {
      const { data } = await supabase
        .from('patient_favorites')
        .select('*, hospital:hospitals(*, hospital_services(*))')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
      setFavorites(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const removeFavorite = async (hospitalId) => {
    await supabase.from('patient_favorites').delete().eq('patient_id', user.id).eq('hospital_id', hospitalId)
    setFavorites(f => f.filter(fav => fav.hospital_id !== hospitalId))
  }

  return (
    <Layout>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Welcome back,</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
              {profile?.full_name || user?.email?.split('@')[0]}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/search">
              <Button variant="secondary" size="sm" icon={<Search size={14} />}>Find Facilities</Button>
            </Link>
            <Button variant="ghost" size="sm" icon={<LogOut size={14} />} onClick={() => { signOut(); navigate('/') }}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {[
            { icon: '🔍', label: 'Find Care', to: '/search', color: 'var(--accent-primary)', bg: 'var(--blue-50)' },
            { icon: '🗺️', label: 'View Map', to: '/map', color: 'var(--accent-secondary)', bg: '#e0f2fe' },
            { icon: '🚨', label: 'Emergency', to: '/emergency', color: 'var(--accent-emergency)', bg: '#fef2f2' },
            { icon: '📖', label: 'How It Works', to: '/how-it-works', color: '#16a34a', bg: '#f0fdf4' },
          ].map(({ icon, label, to, color, bg }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: bg, borderRadius: 'var(--radius-lg)', padding: '20px',
                textAlign: 'center', cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                <p style={{ fontWeight: 700, fontSize: '13px', color }}>{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Account Info */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800,
              flexShrink: 0,
            }}>
              {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>
                {profile?.full_name || 'Patient'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Badge variant="primary">Patient Account</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={<User size={13} />}>
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Saved Facilities */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={18} style={{ color: 'var(--accent-emergency)' }} />
              Saved Facilities
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {favorites.length} saved
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Spinner size={28} color="var(--accent-primary)" />
            </div>
          ) : favorites.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏥</div>
                <p style={{ fontWeight: 600, marginBottom: '6px' }}>No saved facilities yet</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Browse facilities and tap the heart icon to save them here.
                </p>
                <Link to="/search">
                  <Button variant="primary" size="sm">Find Facilities</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {favorites.map(fav => {
                const h = fav.hospital
                if (!h) return null
                return (
                  <Card key={fav.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 'var(--radius-md)',
                      background: 'var(--blue-50)', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                    }}>
                      🏥
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                        {h.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} /> {h.sub_county || h.address}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {h.emergency_available && <Badge variant="danger" size="sm">Emergency</Badge>}
                        {h.hospital_services?.slice(0, 2).map(s => (
                          <Badge key={s.id} variant="primary" size="sm">{s.service_type.replace(/_/g, ' ')}</Badge>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/facility/${h.slug || h.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Heart size={14} style={{ color: 'var(--accent-emergency)', fill: 'var(--accent-emergency)' }} />}
                        onClick={() => removeFavorite(h.id)}
                      />
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
