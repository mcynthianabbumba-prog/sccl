import { useState } from 'react'
import { X } from 'lucide-react'

/* ============================================================
   BUTTON
   ============================================================ */
export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '',
  onClick, type = 'button', icon, iconRight, fullWidth = false,
  ...props
}) {
  const styles = {
    base: `
      inline-flex items-center justify-center gap-2 font-medium
      border border-transparent rounded-[10px] cursor-pointer
      transition-all duration-150 select-none
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      font-[var(--font-body)]
    `,
    variants: {
      primary: `
        bg-[var(--accent-primary)] text-white
        hover:bg-[var(--accent-primary-hover)]
        focus:ring-[var(--accent-primary)]
        active:scale-[0.98]
      `,
      secondary: `
        bg-[var(--bg-tertiary)] text-[var(--text-primary)]
        border-[var(--border-color)]
        hover:bg-[var(--border-color)]
        focus:ring-[var(--accent-primary)]
      `,
      outline: `
        bg-transparent text-[var(--accent-primary)]
        border-[var(--accent-primary)]
        hover:bg-[var(--blue-50)]
        focus:ring-[var(--accent-primary)]
      `,
      ghost: `
        bg-transparent text-[var(--text-secondary)]
        hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
        focus:ring-[var(--accent-primary)]
      `,
      danger: `
        bg-[var(--accent-emergency)] text-white
        hover:bg-red-700
        focus:ring-[var(--accent-emergency)]
      `,
      success: `
        bg-[var(--accent-success)] text-white
        hover:bg-green-700
        focus:ring-[var(--accent-success)]
      `,
    },
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-base',
      icon: 'p-2.5',
    }
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${styles.base} ${styles.variants[variant]} ${styles.sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        borderRadius: 'var(--radius-md)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast)',
        border: variant === 'outline' ? '1px solid var(--accent-primary)' :
                variant === 'secondary' ? '1px solid var(--border-color)' : '1px solid transparent',
        width: fullWidth ? '100%' : undefined,
        opacity: disabled || loading ? 0.6 : 1,
        ...(variant === 'primary' && { background: 'var(--accent-primary)', color: 'white' }),
        ...(variant === 'secondary' && { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }),
        ...(variant === 'outline' && { background: 'transparent', color: 'var(--accent-primary)' }),
        ...(variant === 'ghost' && { background: 'transparent', color: 'var(--text-secondary)' }),
        ...(variant === 'danger' && { background: 'var(--accent-emergency)', color: 'white' }),
        ...(variant === 'success' && { background: 'var(--accent-success)', color: 'white' }),
        padding: size === 'sm' ? '6px 12px' :
                 size === 'md' ? '10px 20px' :
                 size === 'lg' ? '12px 24px' :
                 size === 'xl' ? '16px 32px' : '10px',
        fontSize: size === 'lg' || size === 'xl' ? '16px' : '14px',
      }}
      {...props}
    >
      {loading ? <Spinner size={16} /> : icon}
      {children}
      {iconRight}
    </button>
  )
}

/* ============================================================
   CARD
   ============================================================ */
export function Card({ children, className = '', padding = true, hover = false, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: padding ? '24px' : undefined,
        transition: 'all var(--transition-fast)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.borderColor = 'var(--border-color)'
        e.currentTarget.style.transform = 'translateY(0)'
      } : undefined}
    >
      {children}
    </div>
  )
}

/* ============================================================
   BADGE
   ============================================================ */
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const colors = {
    default: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
    primary: { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    success: { bg: '#dcfce7', color: '#15803d' },
    warning: { bg: '#fef3c7', color: '#b45309' },
    danger: { bg: '#fee2e2', color: '#b91c1c' },
    emergency: { bg: '#fee2e2', color: '#b91c1c' },
    verified: { bg: '#dbeafe', color: '#1d4ed8' },
  }
  const c = colors[variant] || colors.default

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: c.bg,
      color: c.color,
      borderRadius: 'var(--radius-full)',
      fontSize: size === 'sm' ? '11px' : '13px',
      fontWeight: 600,
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-body)',
    }}>
      {children}
    </span>
  )
}

/* ============================================================
   INPUT
   ============================================================ */
export function Input({ label, error, icon, type = 'text', className = '', ...props }) {
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.02em',
          fontFamily: 'var(--font-body)',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            {icon}
          </div>
        )}
        <input
          type={type === 'password' ? (showPwd ? 'text' : 'password') : type}
          style={{
            width: '100%',
            padding: icon ? '10px 40px 10px 40px' : '10px 14px',
            paddingRight: type === 'password' ? '40px' : undefined,
            background: 'var(--bg-secondary)',
            border: `1px solid ${error ? 'var(--accent-emergency)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = error ? 'var(--accent-emergency)' : 'var(--border-color)'}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            }}
          >
            {showPwd ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--accent-emergency)', fontFamily: 'var(--font-body)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

/* ============================================================
   SELECT
   ============================================================ */
export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '13px', fontWeight: 600,
          color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
        }}>
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--bg-secondary)',
          border: `1px solid ${error ? 'var(--accent-emergency)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '14px', fontFamily: 'var(--font-body)',
          outline: 'none', cursor: 'pointer',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--accent-emergency)' }}>{error}</span>}
    </div>
  )
}

/* ============================================================
   TEXTAREA
   ============================================================ */
export function Textarea({ label, error, rows = 4, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '13px', fontWeight: 600,
          color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
        }}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--bg-secondary)',
          border: `1px solid ${error ? 'var(--accent-emergency)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: '14px', fontFamily: 'var(--font-body)',
          outline: 'none', resize: 'vertical',
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: 'var(--accent-emergency)' }}>{error}</span>}
    </div>
  )
}

/* ============================================================
   MODAL
   ============================================================ */
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const widths = { sm: '400px', md: '560px', lg: '720px', xl: '900px' }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: widths[size],
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 0.2s ease',
        }}
      >
        {(title || onClose) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            {title && (
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: '18px',
                fontWeight: 700, color: 'var(--text-primary)',
              }}>
                {title}
              </h3>
            )}
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'var(--bg-tertiary)', border: 'none',
                  borderRadius: 'var(--radius-full)', padding: '6px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  color: 'var(--text-secondary)', transition: 'all var(--transition-fast)',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   SPINNER
   ============================================================ */
export function Spinner({ size = 20, color = 'currentColor' }) {
  return (
    <div
      style={{
        width: size, height: size,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRightColor: color,
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

/* ============================================================
   TOAST / ALERT
   ============================================================ */
export function Alert({ type = 'info', children, onClose }) {
  const colors = {
    info: { bg: 'var(--blue-50)', border: 'var(--blue-200)', color: 'var(--blue-700)' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
    error: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
  }
  const c = colors[type]

  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-md)', padding: '12px 16px',
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      color: c.color, fontSize: '14px', fontFamily: 'var(--font-body)',
    }}>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color }}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}

/* ============================================================
   STAT CARD
   ============================================================ */
export function StatCard({ icon, label, value, change, changeType = 'positive', color = 'blue' }) {
  const colors = {
    blue: { bg: 'var(--blue-50)', color: 'var(--blue-600)' },
    red: { bg: '#fef2f2', color: '#dc2626' },
    green: { bg: '#f0fdf4', color: '#16a34a' },
    amber: { bg: '#fffbeb', color: '#d97706' },
  }
  const c = colors[color] || colors.blue

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>{label}</p>
          <p style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</p>
          {change && (
            <p style={{
              fontSize: '12px', marginTop: '6px',
              color: changeType === 'positive' ? 'var(--accent-success)' : 'var(--accent-emergency)',
              fontWeight: 600,
            }}>
              {changeType === 'positive' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div style={{
          background: c.bg, borderRadius: 'var(--radius-md)',
          padding: '10px', color: c.color,
        }}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

/* ============================================================
   CHECKBOX
   ============================================================ */
export function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '14px',
      color: 'var(--text-primary)',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
      />
      {label}
    </label>
  )
}

/* ============================================================
   DIVIDER
   ============================================================ */
export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
      {label && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
    </div>
  )
}
