import { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--kd-space-2)',
  fontFamily: 'var(--kd-font)',
  fontWeight: 600,
  borderRadius: 'var(--kd-radius-md)',
  border: 'none',
  cursor: 'pointer',
  transition: 'all var(--kd-transition-fast)',
  whiteSpace: 'nowrap',
  lineHeight: 1,
};

const variants: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--kd-primary)',
    color: 'var(--kd-text-inverse)',
  },
  secondary: {
    background: 'var(--kd-primary-light)',
    color: 'var(--kd-green-700)',
    border: '1px solid var(--kd-primary-border)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--kd-text-secondary)',
    border: '1px solid var(--kd-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--kd-text-secondary)',
  },
  danger: {
    background: 'var(--kd-danger)',
    color: 'var(--kd-text-inverse)',
  },
};

const sizes: Record<Size, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 'var(--kd-fs-xs)' },
  md: { padding: '9px 18px', fontSize: 'var(--kd-fs-sm)' },
  lg: { padding: '12px 24px', fontSize: 'var(--kd-fs-base)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      style={{
        ...baseStyle,
        ...variants[variant],
        ...sizes[size],
        width: fullWidth ? '100%' : undefined,
        opacity: isDisabled ? 0.6 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      ) : icon}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
