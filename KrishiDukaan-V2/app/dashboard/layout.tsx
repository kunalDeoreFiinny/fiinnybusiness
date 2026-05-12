'use client';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppShell } from './components/layout/AppShell';

// Note: PendingApprovalPage is missing from the original file's imports but was used
// Let's create a minimal placeholder for it if it doesn't exist, or we assume it exists elsewhere
const PendingApprovalPage = () => (
  <AppShell title="Pending Approval">
    <div style={{ textAlign: 'center', padding: 40 }}>Your shop is pending approval.</div>
  </AppShell>
);

const LoginPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>Please log in.</div>
  </div>
);


function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, shop, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--kd-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌾</div>
          <div style={{ color: 'var(--kd-text-muted)', fontSize: 14 }}>Loading KrishiDukan...</div>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;


  return <>{children}</>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}
