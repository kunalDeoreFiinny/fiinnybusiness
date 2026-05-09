import { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 'var(--kd-radius-md)', style }: SkeletonProps) {
  return (
    <div
      className="kd-pulse"
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--kd-gray-200)',
        ...style,
      }}
    />
  );
}

/** Multiple skeleton lines for text blocks */
export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kd-space-3)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === count - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

/** Skeleton for a stat card */
export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--kd-surface)',
      border: '1px solid var(--kd-border)',
      borderRadius: 'var(--kd-radius-lg)',
      padding: 'var(--kd-space-5) var(--kd-space-6)',
    }}>
      <Skeleton width={80} height={12} style={{ marginBottom: 12 }} />
      <Skeleton width={60} height={28} style={{ marginBottom: 8 }} />
      <Skeleton width={100} height={12} />
    </div>
  );
}
