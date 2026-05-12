'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { getInitials } from '../../utils/formatters';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/dashboard/inventory', label: 'Inventory', icon: <Package size={20} /> },
  { path: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { path: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={20} /> },
  { path: '/dashboard/profile', label: 'Shop Profile', icon: <Store size={20} /> },
  { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { shop, logout, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const ownerName = (user && 'displayName' in user ? user.displayName : '') || shop?.businessName || 'Shop Owner';
  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <aside
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--kd-surface)',
        borderRight: '1px solid var(--kd-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms ease, min-width 200ms ease',
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {/* Brand */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: collapsed ? '0 16px' : '0 20px',
          gap: 12,
          borderBottom: '1px solid var(--kd-border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--kd-radius-md)',
            background: 'linear-gradient(135deg, var(--kd-green-500), var(--kd-green-700))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          🌾
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 'var(--kd-fs-md)', fontWeight: 700, color: 'var(--kd-green-900)', whiteSpace: 'nowrap' }}>
              KrishiDukan
            </div>
            <div style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
              Retailer Portal
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: 'var(--kd-space-3)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            // Exact match for /dashboard root, prefix match for nested routes
            const isActive =
              item.path === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--kd-radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--kd-primary-light)' : 'transparent',
                  color: isActive ? 'var(--kd-green-700)' : 'var(--kd-text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 'var(--kd-fs-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--kd-transition-fast)',
                  textAlign: 'left',
                  width: '100%',
                  fontFamily: 'var(--kd-font)',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--kd-gray-100)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                {!collapsed && item.badge && item.badge > 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      background: 'var(--kd-danger)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 'var(--kd-radius-full)',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--kd-space-3)',
          margin: 'var(--kd-space-2) var(--kd-space-3)',
          borderRadius: 'var(--kd-radius-md)',
          border: '1px solid var(--kd-border)',
          background: 'transparent',
          color: 'var(--kd-text-muted)',
          cursor: 'pointer',
          fontSize: 'var(--kd-fs-xs)',
          gap: 8,
          fontFamily: 'var(--kd-font)',
          transition: 'all var(--kd-transition-fast)',
        }}
      >
        {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
      </button>

      {/* User Profile Footer */}
      <div
        style={{
          padding: collapsed ? 'var(--kd-space-3)' : 'var(--kd-space-3) var(--kd-space-4)',
          borderTop: '1px solid var(--kd-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--kd-radius-full)',
            background: 'linear-gradient(135deg, var(--kd-green-100), var(--kd-green-200))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--kd-fs-xs)',
            fontWeight: 700,
            color: 'var(--kd-green-700)',
            flexShrink: 0,
          }}
        >
          {getInitials(ownerName)}
        </div>
        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--kd-fs-sm)', fontWeight: 600, color: 'var(--kd-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ownerName}
              </div>
              <div style={{ fontSize: 'var(--kd-fs-xs)', color: 'var(--kd-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Shop Owner
              </div>
            </div>
            <button
              onClick={() => void logout()}
              title="Sign out"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--kd-text-muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                borderRadius: 'var(--kd-radius-sm)',
              }}
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
