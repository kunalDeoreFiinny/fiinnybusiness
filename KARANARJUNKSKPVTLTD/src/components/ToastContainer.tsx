import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type ToastType } from '../contexts/ToastContext';

const ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
};

const COLORS: Record<ToastType, { bg: string; color: string; border: string }> = {
    success: { bg: 'hsla(152, 60%, 40%, 0.12)', color: 'var(--primary-light)', border: 'hsla(152, 60%, 40%, 0.35)' },
    error: { bg: 'hsla(0, 84%, 60%, 0.12)', color: '#ff6b6b', border: 'hsla(0, 84%, 60%, 0.35)' },
    warning: { bg: 'hsla(38, 92%, 50%, 0.12)', color: 'var(--secondary)', border: 'hsla(38, 92%, 50%, 0.35)' },
    info: { bg: 'hsla(217, 91%, 60%, 0.12)', color: '#60a5fa', border: 'hsla(217, 91%, 60%, 0.35)' },
};

function ToastItem({ id, type, message }: { id: string; type: ToastType; message: string }) {
    const { removeToast } = useToast();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger slide-in on mount
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    const c = COLORS[type];

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.border}`,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                minWidth: '280px',
                maxWidth: '420px',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: visible ? 'translateX(0) scale(1)' : 'translateX(100px) scale(0.85)',
                opacity: visible ? 1 : 0,
            }}
            onClick={() => removeToast(id)}
        >
            <span style={{ flexShrink: 0 }}>{ICONS[type]}</span>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{message}</span>
            <button
                onClick={e => { e.stopPropagation(); removeToast(id); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.25rem', borderRadius: '6px', flexShrink: 0 }}
            >
                <X size={16} />
            </button>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts } = useToast();

    return (
        <div
            style={{
                position: 'fixed',
                top: '1.25rem',
                right: '1.25rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'flex-end',
                pointerEvents: 'none',
            }}
        >
            {toasts.map(toast => (
                <div key={toast.id} style={{ pointerEvents: 'all' }}>
                    <ToastItem id={toast.id} type={toast.type} message={toast.message} />
                </div>
            ))}
        </div>
    );
}
