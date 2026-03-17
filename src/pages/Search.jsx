// src/pages/Search.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Phone, ChevronLeft, ChevronRight, RotateCcw, Building2 } from 'lucide-react';
import { getFacilities } from '../lib/supabase';
import { Badge, Button, Checkbox, Spinner, Empty, Card } from '../components/ui';

const DIAGNOSIS_OPTIONS = ['Screening', 'Lab Services', 'Newborn Screening'];
const TREATMENT_OPTIONS = ['Hydroxyurea', 'Blood Transfusion', 'Pain Crisis Management'];
const SPECIALIST_OPTIONS = ['Pediatrics', 'Hematology'];

const PER_PAGE = 5;

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    diagnosis: [], treatments: [], specialists: [], emergency: false,
  });

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const arr = prev[type];
      return { ...prev, [type]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ diagnosis: [], treatments: [], specialists: [], emergency: false });
    setPage(1);
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await getFacilities({
        search: query,
        emergency: filters.emergency || undefined,
      });
      setResults(data || []);
      setLoading(false);
    };
    fetch();
  }, [query, filters]);

  const totalPages = Math.ceil(results.length / PER_PAGE);
  const paged = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '24px', gap: 24, minHeight: 'calc(100vh - 61px)' }}>
      {/* Sidebar filters */}
      <aside style={{ width: 220, flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', padding: 20, position: 'sticky', top: 85 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Filters</span>
            <button onClick={resetFilters} style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Reset all</button>
          </div>

          {[
            { label: 'DIAGNOSIS', key: 'diagnosis', options: DIAGNOSIS_OPTIONS, color: 'var(--blue)' },
            { label: 'TREATMENTS', key: 'treatments', options: TREATMENT_OPTIONS, color: 'var(--blue-light)' },
            { label: 'SPECIALISTS', key: 'specialists', options: SPECIALIST_OPTIONS, color: 'var(--green)' },
          ].map(({ label, key, options, color }) => (
            <div key={key} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
              {options.map(opt => (
                <Checkbox
                  key={opt} label={opt}
                  checked={filters[key].includes(opt)}
                  onChange={() => toggleFilter(key, opt)}
                  style={{ marginBottom: 8 }}
                />
              ))}
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.06em', marginBottom: 10 }}>★ EMERGENCY</div>
            <Checkbox
              label="24/7 Urgent Care"
              checked={filters.emergency}
              onChange={() => setFilters(p => ({ ...p, emergency: !p.emergency }))}
            />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1 }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search facilities, clinics, or specialist names..."
              style={{
                width: '100%', padding: '12px 14px 12px 42px',
                border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)',
                fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff',
              }}
            />
          </div>
          <Button type="submit" size="lg">Search</Button>
        </form>

        {/* Results header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20 }}>Matching Facilities</h2>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{results.length} health centers found in your current location</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ color: 'var(--gray-500)' }}>Sort by:</span>
            <select style={{ border: '1.5px solid var(--gray-200)', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
              <option>Relevance</option>
              <option>Distance</option>
              <option>Name</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : paged.length === 0 ? (
          <Empty icon={Building2} title="No facilities found" subtitle="Try adjusting your search or filters" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {paged.map(f => (
              <Card key={f.id} hover style={{ display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: 200, flexShrink: 0, background: 'var(--gray-100)', position: 'relative' }}>
                  {f.image_url ? (
                    <img src={f.image_url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={36} color="var(--gray-300)" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 17 }}>{f.name}</h3>
                        {f.is_verified && <Badge color="green">✓ Verified</Badge>}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--gray-500)' }}>
                        {f.address && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {f.sub_county}</span>}
                        {f.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {f.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {f.has_diagnosis && <Badge color="blue">Has Diagnosis</Badge>}
                    {f.treatments?.includes('Blood Transfusion') && <Badge color="blue">Blood Transfusion Available</Badge>}
                    {f.has_emergency && <Badge color="red">24/7 Emergency</Badge>}
                    {f.specialists?.slice(0, 1).map(s => <Badge key={s} color="gray">{s}</Badge>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      Distance: <strong>{f.distance || '—'}</strong>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/facility/${f.id}`)}>View Full Profile</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '7px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 34, height: 34, borderRadius: 6, border: '1.5px solid', cursor: 'pointer',
                  background: p === page ? 'var(--blue)' : '#fff',
                  color: p === page ? '#fff' : 'var(--gray-700)',
                  borderColor: p === page ? 'var(--blue)' : 'var(--gray-200)',
                  fontWeight: p === page ? 700 : 400, fontSize: 14,
                }}
              >{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '7px 10px', border: '1.5px solid var(--gray-200)', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
