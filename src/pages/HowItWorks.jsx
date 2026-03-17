// src/pages/HowItWorks.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Filter, MousePointer, Baby, Stethoscope, FlaskConical, CheckCircle, Phone } from 'lucide-react';
import { Button, Card } from '../components/ui';

const Step = ({ num, title, desc, icon: Icon }) => (
  <div style={{ display: 'flex', gap: 20, marginBottom: 28, alignItems: 'flex-start' }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{num}</div>
    <div>
      <h3 style={{ fontSize: 16, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  </div>
);

const MapPlaceholder = () => (
  <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius)', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
    <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
      <Map size={36} style={{ margin: '0 auto 8px' }} />
      <div style={{ fontSize: 12 }}>Interactive Map Preview</div>
    </div>
  </div>
);

export const HowItWorks = () => (
  <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px 60px' }}>
    <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
      📘 USER EDUCATION
    </div>
    <h1 style={{ fontSize: 34, marginBottom: 12 }}>How SCCL Works</h1>
    <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 40, lineHeight: 1.7 }}>
      A step-by-step guide to navigating the healthcare system and finding the right services in Mukono.
    </p>

    {/* Finding a Facility */}
    <Card style={{ padding: 32, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Map size={18} color="var(--blue)" />
        </div>
        <h2 style={{ fontSize: 20 }}>Finding a Facility</h2>
      </div>
      <Step num={1} title="Open the Locator" desc="Access the interactive map from the home dashboard or the main menu." />
      <MapPlaceholder />
      <Step num={2} title="Filter by Location & Need" desc="Choose your specific sub-county and filter by service types like 'Maternity', 'Emergency', or 'Lab Services'." />
      <Step num={3} title="Select a Facility" desc="Click on a map pin to view facility hours, contact details, and available medical staff." />
    </Card>

    {/* Understanding Services */}
    <Card style={{ padding: 32, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--blue-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stethoscope size={18} color="var(--blue)" />
        </div>
        <h2 style={{ fontSize: 20 }}>Understanding Services</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { icon: Stethoscope, title: 'Primary Care', desc: 'General check-ups, malaria treatment, and routine immunisations available at most HC III and HC IV centres.', color: 'var(--blue)' },
          { icon: Baby, title: 'Maternal Health', desc: 'Antenatal care and delivery services. Use the platform to find facilities with 24/7 maternity wards.', color: 'var(--green)' },
          { icon: FlaskConical, title: 'Specialized Labs', desc: 'Locate advanced diagnostic centres for blood tests, X-rays, and specialised screenings.', color: 'var(--blue-light)' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} style={{ textAlign: 'center', padding: '20px 12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon size={20} color={color} />
            </div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>{title}</h4>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </Card>

    {/* Getting Care CTA */}
    <Card style={{ padding: 28, background: 'linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%)', marginBottom: 32 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
        <div>
          <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 10 }}>🌟 Getting Care</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            When you arrive at a facility, show your digital profile or facility code for faster registration and tracking.
          </p>
          {['Confirm facility hours before travelling.', 'Bring any previous medical cards or IDs.', 'Call ahead for emergency services via the app links.'].map(tip => (
            <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>
              <CheckCircle size={13} color="#86efac" /> {tip}
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '16px 20px', minWidth: 200 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 10 }}>📱 Mukono Emergency Contacts</div>
          {[['Mukono Gen. Hospital', '0850 123 456'], ['Ambulance Dispatch', '911'], ['DHO Mukono Office', '0414-499 769']].map(([label, num]) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{num}</div>
            </div>
          ))}
          <Link to="/search">
            <button style={{ width: '100%', marginTop: 10, background: '#fff', color: 'var(--blue)', border: 'none', padding: '8px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Start Search Now
            </button>
          </Link>
        </div>
      </div>
    </Card>

    {/* Footer CTA */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Still have questions?</div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Our support team is here to help 24/7</div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost">Contact Support</Button>
        <Link to="/education"><Button>View FAQ</Button></Link>
      </div>
    </div>
  </div>
);
