import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterShopPage } from './pages/RegisterShopPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { ShopStatus } from '@krishidukan/shared';

function AppRoutes() {
  const { user, shop, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
        <div style={{ color: '#6b7280', fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Determine where to route based on shop status
  if (!shop) return <RegisterShopPage />;
  if (shop.status === ShopStatus.PENDING_REVIEW || shop.status === ShopStatus.REJECTED) return <PendingApprovalPage />;
  if (shop.status === ShopStatus.SUSPENDED) return <PendingApprovalPage />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/pending" element={<PendingApprovalPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
