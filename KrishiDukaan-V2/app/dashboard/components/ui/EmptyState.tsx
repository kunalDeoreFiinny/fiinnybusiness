import { ReactNode } from 'react';
import { PackageX } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--kd-space-12) var(--kd-space-6)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 'var(--kd-radius-xl)',
        background: 'var(--kd-gray-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--kd-text-muted)',
        marginBottom: 'var(--kd-space-4)',
      }}>
        {icon ?? <PackageX size={28} />}
      </div>
      <h3 style={{
        fontSize: 'var(--kd-fs-md)',
        fontWeight: 600,
        color: 'var(--kd-text-primary)',
        marginBottom: 'var(--kd-space-2)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: 'var(--kd-fs-sm)',
          color: 'var(--kd-text-muted)',
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: action ? 'var(--kd-space-5)' : 0,
        }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
