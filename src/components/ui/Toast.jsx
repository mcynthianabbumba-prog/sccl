// src/components/ui/Toast.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: { icon: CheckCircle, color: 'var(--green)',  bg: 'var(--green-light)' },
  error:   { icon: XCircle,     color: 'var(--red)',    bg: 'var(--red-light)' },
  warning: { icon: AlertCircle, color: 'var(--yellow)', bg: '#FEF3C7' },
  info:    { icon: Info,        color: 'var(--blue)',   bg: 'var(--blue-pale)' },
};

let uid = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++uid;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map(({ id, message, type }) => {
          const { icon: Icon, color, bg } = ICONS[type] || ICONS.info;
          return (
            <div
              key={id}
              className="fade-in"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#fff', border: `1.5px solid ${color}30`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 10, padding: '12px 14px',
                boxShadow: '0 4px 20px rgba(0,0,0,.12)',
                minWidth: 280, maxWidth: 380,
                pointerEvents: 'all', cursor: 'default',
              }}
            >
              <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ flex: 1, fontSize: 14, color: 'var(--gray-800)', lineHeight: 1.5 }}>{message}</span>
              <button
                onClick={() => dismiss(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0, flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};
