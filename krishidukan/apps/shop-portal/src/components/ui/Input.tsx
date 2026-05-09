import { InputHTMLAttributes, forwardRef, CSSProperties } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: React.ReactNode;
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--kd-border)',
  borderRadius: 'var(--kd-radius-md)',
  fontSize: 'var(--kd-fs-base)',
  fontFamily: 'var(--kd-font)',
  color: 'var(--kd-text-primary)',
  background: 'var(--kd-surface)',
  outline: 'none',
  transition: 'border-color var(--kd-transition-fast), box-shadow var(--kd-transition-fast)',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, style, ...rest }, ref) => {
    return (
      <div style={{ marginBottom: 'var(--kd-space-4)' }}>
        {label && (
          <label style={{
            display: 'block',
            fontSize: 'var(--kd-fs-sm)',
            fontWeight: 500,
            color: 'var(--kd-text-secondary)',
            marginBottom: 'var(--kd-space-1)',
          }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {icon && (
            <span style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--kd-text-muted)',
              display: 'flex',
            }}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            style={{
              ...inputStyle,
              paddingLeft: icon ? 38 : 14,
              borderColor: error ? 'var(--kd-danger)' : undefined,
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--kd-danger)' : 'var(--kd-primary)';
              e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)'}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--kd-danger)' : 'var(--kd-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            {...rest}
          />
        </div>
        {error && <p style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-danger)', marginTop: 4 }}>{error}</p>}
        {hint && !error && <p style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-text-muted)', marginTop: 4 }}>{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
