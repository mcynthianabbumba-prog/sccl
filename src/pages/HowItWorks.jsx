import { Link } from 'react-router-dom'
import { Map, Filter, Building, Stethoscope, FlaskConical, Phone, ArrowRight, HelpCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { Card, Button } from '../components/ui'

export default function HowItWorksPage() {
  const Step = ({ number, title, desc }) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--accent-primary)', color: 'white',
        fontSize: '13px', fontWeight: 800, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        marginTop: '2px',
      }}>
        {number}
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{title}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  )

  const ServiceCard = ({ icon: Icon, title, desc }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: '10px', padding: '20px',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-md)',
        background: 'var(--blue-50)', color: 'var(--accent-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} />
      </div>
      <p style={{ fontWeight: 700, fontSize: '14px' }}>{title}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 24px) clamp(32px, 5vw, 60px)' }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.06em' }}>
          USER EDUCATION
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 800, marginBottom: '12px',
        }}>
          How SCCL Works
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '48px', lineHeight: 1.7 }}>
          A step-by-step guide to navigating the healthcare system and finding the right services in Mukono.
        </p>

        {/* Step 1: Finding a Facility */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--blue-50)', padding: '8px', borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)' }}>
              <Map size={18} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
              Finding a Facility
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <Step number={1} title="Open the Locator"
              desc="Access the interactive map from the home dashboard or the main menu." />
            <Step number={2} title="Filter by Location & Need"
              desc="Choose your specific sub-county and filter by service types like 'Maternity', 'Emergency', or 'Lab Services'." />
            <Step number={3} title="Select a Facility"
              desc="Click on a map pin to view facility hours, contact details, and available medical staff." />
          </div>

          {/* Map preview placeholder */}
          <div style={{
            height: '180px', background: 'linear-gradient(135deg, #e8f0fe, #c7d7fb)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', border: '1px solid var(--blue-200)',
          }}>
            🗺️
          </div>
        </Card>

        {/* Step 2: Understanding Services */}
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: 'var(--radius-md)', color: '#16a34a' }}>
              <Stethoscope size={18} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
              Understanding Services
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <ServiceCard
              icon={Building}
              title="Primary Care"
              desc="General check-ups, malaria treatment, and routine immunizations available at most HC III and HC IV centers."
            />
            <ServiceCard
              icon={Stethoscope}
              title="Maternal Health"
              desc="Antenatal care and delivery services. Use the platform to find facilities with 24/7 maternity wards."
            />
            <ServiceCard
              icon={FlaskConical}
              title="Specialized Labs"
              desc="Locate advanced diagnostic centers for blood tests, X-rays, and specialized screenings."
            />
          </div>
        </Card>

        {/* Getting Care CTA */}
        <div style={{
          background: 'linear-gradient(135deg, var(--blue-600), var(--blue-900))',
          borderRadius: 'var(--radius-xl)', padding: '28px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
          marginBottom: '32px',
          alignItems: 'center',
        }} className="getting-care-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>☀️</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'white' }}>
                Getting Care
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '14px', lineHeight: 1.7 }}>
              When you arrive at a facility, show your digital profile or facility code for faster registration and tracking.
            </p>
            {[
              'Confirm facility hours before traveling.',
              'Bring any previous medical cards or IDs.',
              'Call ahead for emergency services via the app links.',
            ].map(tip => (
              <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#86efac', fontSize: '13px', marginTop: '1px' }}>✓</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)',
            padding: '20px', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px' }}>📋</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>Mukono Emergency Contacts</span>
            </div>
            {[
              { name: 'Mukono Gen. Hospital', phone: '0852 123 456' },
              { name: 'Ambulance Dispatch', phone: '911' },
              { name: 'DHO Mukono Office', phone: '0414 498 769' },
            ].map(({ name, phone }) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{name}</span>
                <span style={{ fontSize: '12px', color: 'white', fontWeight: 700 }}>{phone}</span>
              </div>
            ))}
            <Link to="/search">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                style={{ marginTop: '12px', background: 'white', color: 'var(--blue-700)' }}
              >
                Start Search Now
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={18} style={{ color: 'var(--text-muted)' }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px' }}>Still have questions?</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Our support team is here to help 24/7.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/emergency">
              <Button variant="outline" size="sm">Contact Support</Button>
            </Link>
            <Link to="/search">
              <Button variant="primary" size="sm" icon={<ArrowRight size={13} />}>
                View FAQ
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '40px' }}>
          SCCL Platform — Improving healthcare accessibility across Mukono district through digital innovation.
        </p>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .getting-care-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  )
}
