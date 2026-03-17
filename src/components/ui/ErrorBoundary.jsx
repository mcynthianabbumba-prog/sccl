// src/components/ui/ErrorBoundary.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('SCCL ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
        <h2 style={{ fontSize: 22, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 8, maxWidth: 400, lineHeight: 1.7 }}>
          An unexpected error occurred. Please refresh the page or go back to the home screen.
        </p>
        {process.env.NODE_ENV === 'development' && this.state.error && (
          <pre style={{
            fontSize: 12, background: 'var(--gray-100)', padding: 16, borderRadius: 8,
            maxWidth: 600, overflowX: 'auto', textAlign: 'left', marginBottom: 24, color: 'var(--red)',
          }}>
            {this.state.error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: '10px 22px', background: 'var(--blue)', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}
          >
            Refresh page
          </button>
          <Link to="/">
            <button style={{
              padding: '10px 22px', background: '#fff', color: 'var(--gray-700)',
              border: '1.5px solid var(--gray-200)', borderRadius: 8, fontWeight: 600,
              fontSize: 14, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>
              Go home
            </button>
          </Link>
        </div>
      </div>
    );
  }
}
