import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RegisterShopPage } from './pages/RegisterShopPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppRoutes() {
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

  // Determine where to route based on shop status
  if (!shop) return <RegisterShopPage />;
  if (shop.status === ShopStatus.PENDING_REVIEW || shop.status === ShopStatus.REJECTED) return <PendingApprovalPage />;
  if (shop.status === ShopStatus.SUSPENDED) return <PendingApprovalPage />;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
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
