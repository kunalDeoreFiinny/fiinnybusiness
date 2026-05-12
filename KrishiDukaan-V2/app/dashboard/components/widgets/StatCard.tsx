import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: string;
}

export function StatCard({ label, value, subtitle, icon, trend, color = 'var(--kd-primary)' }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--kd-surface)',
        border: '1px solid var(--kd-border)',
        borderRadius: 'var(--kd-radius-lg)',
        padding: 'var(--kd-space-5) var(--kd-space-6)',
        transition: 'box-shadow var(--kd-transition-base), border-color var(--kd-transition-base)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--kd-shadow-md)';
        e.currentTarget.style.borderColor = 'var(--kd-green-200)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--kd-border)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 'var(--kd-fs-sm)', color: 'var(--kd-text-secondary)', fontWeight: 500 }}>
          {label}
        </span>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--kd-radius-md)',
            background: `${color}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 'var(--kd-fs-3xl)', fontWeight: 800, color: 'var(--kd-text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        {trend && (
          <span
            style={{
              fontSize: 'var(--kd-fs-xs)',
              fontWeight: 600,
              color: trend.positive ? 'var(--kd-success)' : 'var(--kd-danger)',
            }}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
