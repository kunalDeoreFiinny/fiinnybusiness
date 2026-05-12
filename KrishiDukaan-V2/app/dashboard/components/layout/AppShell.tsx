'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export function AppShell({ children, title, subtitle, headerActions }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--kd-bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={title} subtitle={subtitle} actions={headerActions} />
        <main
          style={{
            flex: 1,
            padding: 'var(--kd-space-6)',
            maxWidth: 'var(--kd-content-max-width)',
            width: '100%',
            margin: '0 auto',
          }}
          className="kd-fade-in"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
