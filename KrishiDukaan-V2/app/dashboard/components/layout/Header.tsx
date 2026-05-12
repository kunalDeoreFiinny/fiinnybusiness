'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onMenuToggle?: () => void;
}

export function Header({ title, subtitle, actions, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { shop } = useAuth();

  return (
    <header
      style={{
        height: 64,
        background: 'var(--kd-surface)',
        borderBottom: '1px solid var(--kd-border)',
        padding: '0 var(--kd-space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--kd-space-4)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Mobile menu toggle */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--kd-text-secondary)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <Menu size={22} />
        </button>
      )}

      {/* Page Title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 'var(--kd-fs-lg)', fontWeight: 700, color: 'var(--kd-text-primary)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-text-muted)', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Custom Actions */}
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--kd-space-3)' }}>{actions}</div>}

      {/* Quick Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 14px',
          background: 'var(--kd-gray-50)',
          border: '1px solid var(--kd-border)',
          borderRadius: 'var(--kd-radius-full)',
          color: 'var(--kd-text-muted)',
          fontSize: 'var(--kd-fs-sm)',
          cursor: 'pointer',
          minWidth: 160,
          transition: 'border-color var(--kd-transition-fast)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--kd-gray-300)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--kd-border)'; }}
      >
        <Search size={14} />
        <span>Search...</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 4,
          background: 'var(--kd-surface)',
          border: '1px solid var(--kd-border)',
          color: 'var(--kd-text-muted)',
        }}>
          ⌘K
        </span>
      </div>

      {/* Notifications Bell */}
      <button
        onClick={() => router.push('/dashboard/notifications')}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          color: 'var(--kd-text-secondary)',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 'var(--kd-radius-md)',
          display: 'flex',
          transition: 'background var(--kd-transition-fast)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--kd-gray-100)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        <Bell size={20} />
        {/* Notification dot */}
        <span style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--kd-danger)',
          border: '2px solid var(--kd-surface)',
        }} />
      </button>

      {/* Shop Name Pill */}
      {shop && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          borderRadius: 'var(--kd-radius-full)',
          background: 'var(--kd-primary-light)',
          border: '1px solid var(--kd-primary-border)',
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--kd-success)',
          }} />
          <span style={{
            fontSize: 'var(--kd-fs-xs)',
            fontWeight: 600,
            color: 'var(--kd-green-700)',
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {shop.businessName}
          </span>
        </div>
      )}
    </header>
  );
}
