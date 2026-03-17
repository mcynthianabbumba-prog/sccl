// src/pages/Education.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download, ChevronRight, Mail, Send } from 'lucide-react';
import { getResources, getFaqs } from '../lib/supabase';
import { Badge, Button, Card, Spinner } from '../components/ui';

const TABS = [
  { key: 'understanding_scd', label: 'Understanding SCD' },
  { key: 'management', label: 'Management & Nutrition' },
  { key: 'advocacy', label: 'Advocacy' },
  { key: 'research', label: 'Latest Research' },
];

const TYPE_COLORS = {
  article:      'blue',
  nutrition:    'green',
  mental_health:'yellow',
  infographic:  'gray',
};

// Hardcoded FAQ data since supabase function may not exist yet
const STATIC_FAQS = [
  { question: 'What are the early signs of a pain crisis?', id: '1' },
  { question: 'How does SCD impact hydration needs?', id: '2' },
  { question: 'Is exercise safe for SCD patients?', id: '3' },
];

export const Education = () => {
  const [tab, setTab] = useState('understanding_scd');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setLoading(true);
    getResources(tab).then(({ data }) => {
      setResources(data || []);
      setLoading(false);
    });
  }, [tab]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2044 0%, #1a3a6e 50%, #1e4a8e 100%)',
        padding: '40px 24px', marginBottom: 0, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <Badge color="blue" style={{ marginBottom: 16, background: 'rgba(255,255,255,0.12)', color: '#93C5FD' }}>FEATURED RESOURCE</Badge>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 14, lineHeight: 1.2 }}>
            Knowledge is Power: Understanding<br />Your SCD Journey
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 28, maxWidth: 560, lineHeight: 1.6 }}>
            Comprehensive insights into managing health, finding community, and advocating for better care.
          </p>
          <Button style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Explore Guide <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: 61, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 4 }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: tab === key ? 700 : 400, color: tab === key ? 'var(--blue)' : 'var(--gray-600)',
                borderBottom: tab === key ? '2.5px solid var(--blue)' : '2.5px solid transparent',
                fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'all 0.15s',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {/* Static FAQ card */}
            <Card style={{ padding: 24, background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <BookOpen size={18} color="var(--blue)" />
                <h3 style={{ fontSize: 15 }}>Top Patient FAQs</h3>
              </div>
              {STATIC_FAQS.map(faq => (
                <div key={faq.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--gray-700)' }}>
                  <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>?</span>
                  {faq.question}
                </div>
              ))}
              <button style={{ fontSize: 13, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: 4 }}>
                View all questions →
              </button>
            </Card>

            {/* Resource cards from DB */}
            {resources.slice(0, 2).map(r => (
              <Card key={r.id} hover style={{ overflow: 'hidden' }}>
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: 120, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={28} color="var(--gray-300)" />
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Badge color={TYPE_COLORS[r.resource_type] || 'gray'} style={{ fontSize: 10, textTransform: 'uppercase' }}>{r.resource_type}</Badge>
                    {r.read_time && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.read_time} min read</span>}
                  </div>
                  <h3 style={{ fontSize: 14, marginBottom: 6, lineHeight: 1.4 }}>{r.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 12 }}>{r.summary}</p>
                  {r.author && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>By {r.author}</div>}
                  {r.download_url && (
                    <a href={r.download_url} download>
                      <Button size="sm" variant="ghost" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                        <Download size={12} /> Download Resource
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}

            {/* Advocacy / policy card */}
            <Card style={{ padding: 24, background: 'var(--gray-900)', gridColumn: tab === 'advocacy' ? 'auto' : 'auto' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, marginBottom: 12 }}>📢</div>
              <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>Policy & Advocacy</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                Learn how to share your story and push for better healthcare legislation for the SCD community.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[['Global Awareness Month', 'var(--blue)', 'SEP 2024'], ['Healthcare Equity Bill', 'var(--yellow)', 'IN REVIEW']].map(([label, c, badge]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 6, padding: '8px 12px' }}>
                    <span style={{ color: '#fff', fontSize: 13 }}>{label}</span>
                    <span style={{ fontSize: 11, color: c, fontWeight: 700 }}>{badge}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', background: 'var(--blue)', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Get Involved
              </button>
            </Card>

            {/* Remaining resource cards */}
            {resources.slice(2).map(r => (
              <Card key={r.id} hover style={{ overflow: 'hidden' }}>
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: 120, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={28} color="var(--gray-300)" />
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Badge color={TYPE_COLORS[r.resource_type] || 'gray'} style={{ fontSize: 10, textTransform: 'uppercase' }}>{r.resource_type}</Badge>
                    {r.read_time && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.read_time} min read</span>}
                  </div>
                  <h3 style={{ fontSize: 14, marginBottom: 6, lineHeight: 1.4 }}>{r.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 12 }}>{r.summary}</p>
                  {r.author && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>By {r.author}</div>}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div style={{ marginTop: 48, borderTop: '1px solid var(--gray-200)', paddingTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>Stay Informed</h2>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 20 }}>
              Get the latest research, diet tips, and community advocacy updates delivered directly to your inbox every month.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
              />
              <Button>Join</Button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>RESOURCES</div>
              {['Patient Stories','Clinical Trials','Financial Assistance','Healthcare Finder'].map(t => (
                <Link key={t} to="#" style={{ display: 'block', fontSize: 14, color: 'var(--gray-600)', marginBottom: 8 }}>{t}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>ABOUT SCD HUB</div>
              {['Our Mission','Medical Board','Partnerships','Contact Support'].map(t => (
                <Link key={t} to="#" style={{ display: 'block', fontSize: 14, color: 'var(--gray-600)', marginBottom: 8 }}>{t}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
