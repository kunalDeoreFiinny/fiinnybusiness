import { CSSProperties } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  style?: CSSProperties;
}

const colors: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: 'var(--kd-green-50)', text: 'var(--kd-green-700)', dot: 'var(--kd-green-500)' },
  warning: { bg: 'var(--kd-warning-light)', text: 'var(--kd-amber-600)', dot: 'var(--kd-amber-500)' },
  danger: { bg: 'var(--kd-danger-light)', text: 'var(--kd-danger)', dot: 'var(--kd-red-500)' },
  info: { bg: 'var(--kd-info-light)', text: 'var(--kd-blue-600)', dot: 'var(--kd-blue-500)' },
  neutral: { bg: 'var(--kd-gray-100)', text: 'var(--kd-gray-600)', dot: 'var(--kd-gray-400)' },
};

export function Badge({ children, variant = 'neutral', dot = false, style }: BadgeProps) {
  const c = colors[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 'var(--kd-radius-full)',
        fontSize: 'var(--kd-fs-xs)',
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        lineHeight: 1.4,
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />}
      {children}
    </span>
  );
}
