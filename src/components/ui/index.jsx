// src/components/ui/Button.jsx
import React from 'react';

const variants = {
  primary:   'background:var(--blue);color:#fff;border:none',
  secondary: 'background:#fff;color:var(--blue);border:1.5px solid var(--blue)',
  danger:    'background:var(--red);color:#fff;border:none',
  ghost:     'background:transparent;color:var(--gray-600);border:1.5px solid var(--gray-200)',
};
const sizes = {
  sm: 'padding:6px 14px;font-size:13px;',
  md: 'padding:10px 20px;font-size:14px;',
  lg: 'padding:13px 28px;font-size:15px;',
};

export const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, fullWidth = false, style = {}, ...props
}) => (
  <button
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      gap: '8px', borderRadius: 'var(--radius-sm)', fontWeight: 600,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
      opacity: props.disabled || loading ? 0.6 : 1,
      transition: 'all 0.15s', width: fullWidth ? '100%' : undefined,
      ...Object.fromEntries(variants[variant].split(';').filter(Boolean).map(s => s.split(':'))),
      ...Object.fromEntries(sizes[size].split(';').filter(Boolean).map(s => s.split(':'))),
      ...style,
    }}
    {...props}
  >
    {loading ? <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : null}
    {children}
  </button>
);

// ─── Input ───────────────────────────────────────────────────────────────────
export const Input = ({ label, error, icon: Icon, style = {}, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
      )}
      <input
        style={{
          width: '100%', padding: Icon ? '10px 14px 10px 36px' : '10px 14px',
          border: `1.5px solid ${error ? 'var(--red)' : 'var(--gray-200)'}`,
          borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none',
          background: '#fff', color: 'var(--gray-800)', transition: 'border 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--blue)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--gray-200)'}
        {...props}
      />
    </div>
    {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'blue', style = {} }) => {
  const colors = {
    blue:   { bg: 'var(--blue-pale)', text: 'var(--blue)' },
    red:    { bg: 'var(--red-light)', text: 'var(--red)' },
    green:  { bg: 'var(--green-light)', text: 'var(--green)' },
    yellow: { bg: '#FEF3C7', text: 'var(--yellow)' },
    gray:   { bg: 'var(--gray-100)', text: 'var(--gray-600)' },
  };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, background: colors[color]?.bg, color: colors[color]?.text,
      fontFamily: "'Plus Jakarta Sans', sans-serif", ...style,
    }}>{children}</span>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style = {}, hover = false, ...props }) => (
  <div
    style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)',
      overflow: 'hidden', transition: hover ? 'box-shadow 0.2s, transform 0.2s' : undefined,
      ...style,
    }}
    onMouseEnter={hover ? e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)'; } : undefined}
    onMouseLeave={hover ? e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; } : undefined}
    {...props}
  >
    {children}
  </div>
);

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 24 }) => (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{
      width: size, height: size, border: '3px solid var(--gray-200)',
      borderTopColor: 'var(--blue)', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  </>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
export const Empty = ({ icon: Icon, title, subtitle }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gray-500)' }}>
    {Icon && <Icon size={40} style={{ margin: '0 auto 16px', color: 'var(--gray-300)' }} />}
    <p style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>{title}</p>
    {subtitle && <p style={{ fontSize: 14 }}>{subtitle}</p>}
  </div>
);

// ─── Checkbox ────────────────────────────────────────────────────────────────
export const Checkbox = ({ label, checked, onChange, style = {} }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...style }}>
    <input type="checkbox" checked={checked} onChange={onChange}
      style={{ width: 16, height: 16, accentColor: 'var(--blue)', cursor: 'pointer' }} />
    <span style={{ fontSize: 14, color: 'var(--gray-700)' }}>{label}</span>
  </label>
);
