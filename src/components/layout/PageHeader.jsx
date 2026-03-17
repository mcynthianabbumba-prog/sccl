// src/components/layout/PageHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb + page title banner used across inner pages.
 *
 * Usage:
 *   <PageHeader
 *     crumbs={[{ label: 'Home', to: '/' }, { label: 'Search' }]}
 *     title="Search Facilities"
 *     subtitle="Find SCD care near you"
 *   />
 */
export const PageHeader = ({ crumbs = [], title, subtitle, action }) => (
  <div style={{
    background: '#fff', borderBottom: '1px solid var(--gray-100)',
    padding: '20px 0 0',
  }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      {/* Breadcrumb */}
      {crumbs.length > 0 && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={12} color="var(--gray-400)" />}
              {c.to ? (
                <Link to={c.to} style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>{c.label}</Link>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--gray-700)', fontWeight: 600 }}>{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 20 }}>
        <div>
          {title && <h1 style={{ fontSize: 24, fontWeight: 800 }}>{title}</h1>}
          {subtitle && <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  </div>
);
