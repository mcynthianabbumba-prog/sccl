import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Filter, MapPin, Phone, CheckCircle, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout/Layout'
import { Button, Card, Badge, Spinner } from '../components/ui'

const SERVICE_FILTERS = [
  { label: 'Screening', value: 'sickle_cell_testing', category: 'DIAGNOSIS' },
  { label: 'Lab Services', value: 'lab_services', category: 'DIAGNOSIS' },
  { label: 'Newborn Screening', value: 'newborn_screening', category: 'DIAGNOSIS' },
  { label: 'Hydroxyurea', value: 'hydroxyurea_treatment', category: 'TREATMENTS' },
  { label: 'Blood Transfusion', value: 'blood_transfusion', category: 'TREATMENTS' },
  { label: 'Pain Crisis Management', value: 'pain_crisis_management', category: 'TREATMENTS' },
  { label: 'Pediatrics', value: 'pediatrics', category: 'SPECIALISTS' },
  { label: 'Hematology', value: 'hematology', category: 'SPECIALISTS' },
  { label: '24/7 Urgent Care', value: 'emergency', category: 'EMERGENCY' },
]

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Distance', value: 'distance' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Verified First', value: 'verified' },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [selectedServices, setSelectedServices] = useState([])
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [sort, setSort] = useState('relevance')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const PER_PAGE = 6

  async function fetchHospitals() {
    setLoading(true)
    let q = supabase
      .from('hospitals')
      .select('*, hospital_services(*)', { count: 'exact' })
      .eq('is_active', true)

    if (query) q = q.ilike('name', `%${query}%`)
    if (emergencyOnly) q = q.eq('emergency_available', true)

    if (sort === 'name') q = q.order('name')
    else if (sort === 'verified') q = q.order('is_verified', { ascending: false })
    else q = q.order('is_verified', { ascending: false }).order('name')

    const from = (page - 1) * PER_PAGE
    q = q.range(from, from + PER_PAGE - 1)

    const { data, count } = await q
    setHospitals(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => { fetchHospitals() }, [query, selectedServices, emergencyOnly, sort, page])

  const toggleService = (val) => {
    setSelectedServices(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
    setPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchParams(query ? { q: query } : {})
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  const FilterSection = ({ category, filters }) => (
    <div style={{ marginBottom: '20px' }}>
      <p style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
        color: category === 'EMERGENCY' ? 'var(--accent-emergency)' : 'var(--accent-primary)',
        marginBottom: '10px',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        {category === 'EMERGENCY' && '★ '}{category}
      </p>
      {filters.map(({ label, value }) => (
        <label key={value} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '8px', cursor: 'pointer',
          fontSize: '13px', color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
        }}>
          <input
            type="checkbox"
            checked={selectedServices.includes(value)}
            onChange={() => toggleService(value)}
            style={{ accentColor: 'var(--accent-primary)', width: '14px', height: '14px' }}
          />
          {label}
        </label>
      ))}
    </div>
  )

  const categories = [...new Set(SERVICE_FILTERS.map(f => f.category))]

  return (
    <Layout>
      <div style={{ minHeight: '80vh', display: 'flex' }}>
        {/* Sidebar Filters - Desktop */}
        <aside style={{
          width: '220px', flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
          padding: 'clamp(16px, 2vw, 28px) clamp(12px, 2vw, 20px)',
          background: 'var(--bg-secondary)',
          display: 'flex', flexDirection: 'column',
        }} className="search-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>Filters</span>
            {(selectedServices.length > 0 || emergencyOnly) && (
              <button
                onClick={() => { setSelectedServices([]); setEmergencyOnly(false) }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '12px', color: 'var(--accent-primary)', fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                }}
              >
                Reset all
              </button>
            )}
          </div>
          {categories.map(cat => (
            <FilterSection
              key={cat}
              category={cat}
              filters={SERVICE_FILTERS.filter(f => f.category === cat)}
            />
          ))}
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '28px 24px', minWidth: 0 }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center',
          }}>
            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '10px' }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', padding: '0 14px',
              }}>
                <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search facilities, clinics, or specialist names..."
                  style={{
                    flex: 1, border: 'none', background: 'none', outline: 'none',
                    fontSize: '14px', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)', padding: '10px 0',
                  }}
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); setSearchParams({}) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <Button type="submit" variant="primary">Search</Button>
            </form>

            {/* Mobile filter button */}
            <button
              className="mobile-filter-btn"
              onClick={() => setFiltersOpen(!filtersOpen)}
              style={{
                display: 'none', alignItems: 'center', gap: '6px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                cursor: 'pointer', color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: '14px',
              }}
            >
              <SlidersHorizontal size={15} /> Filters
              {selectedServices.length > 0 && (
                <span style={{
                  background: 'var(--accent-primary)', color: 'white',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {selectedServices.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Filters Drawer */}
          {filtersOpen && (
            <div style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px',
              animation: 'fadeIn 0.2s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Filters</span>
                <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                {categories.map(cat => (
                  <FilterSection key={cat} category={cat} filters={SERVICE_FILTERS.filter(f => f.category === cat)} />
                ))}
              </div>
            </div>
          )}

          {/* Results header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>
                Matching Facilities
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {loading ? 'Searching...' : `${total} health centers found`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  padding: '6px 10px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none',
                }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <Spinner size={32} color="var(--accent-primary)" />
            </div>
          ) : hospitals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>No facilities found</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters or search terms</p>
              <Button variant="outline" onClick={() => { setQuery(''); setSelectedServices([]); setEmergencyOnly(false) }} style={{ marginTop: '20px' }}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {hospitals.map(h => <SearchResultCard key={h.id} hospital={h} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={paginationBtnStyle(false, page === 1)}
              >
                ‹
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1
                return (
                  <button key={p} onClick={() => setPage(p)} style={paginationBtnStyle(p === page, false)}>
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={paginationBtnStyle(false, page === totalPages)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .search-sidebar { display: none !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </Layout>
  )
}

function paginationBtnStyle(active, disabled) {
  return {
    width: 36, height: 36, borderRadius: 'var(--radius-md)',
    border: active ? 'none' : '1px solid var(--border-color)',
    background: active ? 'var(--accent-primary)' : 'var(--bg-secondary)',
    color: active ? 'white' : 'var(--text-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px', fontFamily: 'var(--font-body)',
    opacity: disabled ? 0.4 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

function SearchResultCard({ hospital }) {
  const services = hospital.hospital_services?.slice(0, 4) || []
  return (
    <Card hover padding={false} style={{ display: 'flex', overflow: 'hidden' }}>
      {/* Image */}
      <div style={{
        width: '220px', flexShrink: 0,
        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '40px', position: 'relative', overflow: 'hidden',
      }} className="result-img">
        {hospital.photo_url ? (
          <img src={hospital.photo_url} alt={hospital.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : '🏥'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {hospital.name}
          </h3>
          {hospital.is_verified && <Badge variant="verified">✓ Verified</Badge>}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <MapPin size={12} /> {hospital.address || hospital.sub_county}
        </p>
        {hospital.phone && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
            <Phone size={12} /> {hospital.phone}
          </p>
        )}

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {hospital.emergency_available && <Badge variant="emergency">24/7 Emergency</Badge>}
          {services.map(s => (
            <Badge key={s.id} variant="primary">
              {s.service_type.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {hospital.latitude ? '📍 Location available' : ''}
          </span>
          <Link to={`/facility/${hospital.slug || hospital.id}`}>
            <Button variant="outline" size="sm">View Full Profile</Button>
          </Link>
        </div>
      </div>

      <style>{`@media (max-width: 600px) { .result-img { display: none !important; } }`}</style>
    </Card>
  )
}
