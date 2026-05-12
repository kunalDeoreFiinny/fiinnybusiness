import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddings = {
  none: 0,
  sm: 'var(--kd-space-4)',
  md: 'var(--kd-space-5) var(--kd-space-6)',
  lg: 'var(--kd-space-8)',
};

export function Card({ children, style, padding = 'md', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--kd-surface)',
        border: '1px solid var(--kd-border)',
        borderRadius: 'var(--kd-radius-lg)',
        padding: paddings[padding],
        boxShadow: 'var(--kd-shadow-xs)',
        transition: 'box-shadow var(--kd-transition-base), border-color var(--kd-transition-base)',
        cursor: onClick || hover ? 'pointer' : undefined,
        ...(hover ? {
          ':hover': { boxShadow: 'var(--kd-shadow-md)', borderColor: 'var(--kd-green-200)' }
        } : {}),
        ...style,
      }}
      onMouseEnter={hover || onClick ? (e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--kd-shadow-md)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--kd-green-200)';
      } : undefined}
      onMouseLeave={hover || onClick ? (e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--kd-shadow-xs)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--kd-border)';
      } : undefined}
    >
      {children}
    </div>
  );
}
