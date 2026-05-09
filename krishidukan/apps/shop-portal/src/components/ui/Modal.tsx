import { ReactNode, CSSProperties, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, width = 480, footer }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  const panelStyle: CSSProperties = {
    background: 'var(--kd-surface)',
    borderRadius: 'var(--kd-radius-xl)',
    width: '100%',
    maxWidth: width,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--kd-shadow-xl)',
    animation: 'kdModalIn 200ms ease forwards',
    margin: 'var(--kd-space-4)',
  };

  return (
    <div className="kd-modal-backdrop" onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--kd-space-5) var(--kd-space-6)',
            borderBottom: '1px solid var(--kd-border)',
          }}>
            <h3 style={{ fontSize: 'var(--kd-fs-lg)', fontWeight: 700, color: 'var(--kd-text-primary)' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--kd-text-muted)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 'var(--kd-radius-sm)',
                display: 'flex',
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: 'var(--kd-space-6)', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--kd-space-3)',
            padding: 'var(--kd-space-4) var(--kd-space-6)',
            borderTop: '1px solid var(--kd-border)',
          }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes kdModalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}
