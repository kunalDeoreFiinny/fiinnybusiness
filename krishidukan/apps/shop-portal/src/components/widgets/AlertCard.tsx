import { ReactNode } from 'react';

interface AlertCardProps {
  icon: ReactNode;
  title: string;
  message: string;
  variant?: 'warning' | 'danger' | 'info' | 'success';
  action?: ReactNode;
}

const variantStyles: Record<string, { bg: string; border: string; iconColor: string }> = {
  warning: { bg: 'var(--kd-warning-light)', border: '#fde68a', iconColor: 'var(--kd-amber-600)' },
  danger: { bg: 'var(--kd-danger-light)', border: '#fca5a5', iconColor: 'var(--kd-danger)' },
  info: { bg: 'var(--kd-info-light)', border: '#bfdbfe', iconColor: 'var(--kd-blue-600)' },
  success: { bg: 'var(--kd-primary-light)', border: 'var(--kd-primary-border)', iconColor: 'var(--kd-green-700)' },
};

export function AlertCard({ icon, title, message, variant = 'warning', action }: AlertCardProps) {
  const s = variantStyles[variant]!;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: 'var(--kd-space-4) var(--kd-space-5)',
      borderRadius: 'var(--kd-radius-lg)',
      background: s.bg,
      border: `1px solid ${s.border}`,
    }}>
      <span style={{ color: s.iconColor, marginTop: 2, flexShrink: 0, display: 'flex' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--kd-fs-sm)', fontWeight: 600, color: s.iconColor, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-text-secondary)', lineHeight: 1.5 }}>{message}</div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
