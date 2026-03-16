import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Users, UserPlus, LogOut, ReceiptText, ShieldAlert, Calculator, Settings, Package, ChevronDown, Layers, Palette, Database, Factory, Truck, Store, ShoppingCart, BarChart3, Activity, FileText, Bell, ClipboardList, Star, Link2, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import OnboardingPage from './pages/OnboardingPage';
import WorklistPage from './pages/WorklistPage';
import WorklistDetailsPage from './pages/WorklistDetailsPage';
import DashboardPage from './pages/DashboardPage';
import B2CDashboardPage from './pages/B2CDashboardPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import StorefrontPage from './pages/StorefrontPage';
import AdminStoreProductsPage from './pages/AdminStoreProductsPage';
import RateSheetPage from './pages/RateSheetPage';
import InvoiceSettingsPage from './pages/InvoiceSettingsPage';
import ManageRetailersPage from './pages/ManageRetailersPage';
import POSPage from './pages/POSPage';
import SettingsPage from './pages/SettingsPage';
import SchemaBuilderPage from './pages/SchemaBuilderPage';
import InvoiceTemplateBuilderPage from './pages/InvoiceTemplateBuilderPage';
import ManufacturersPage from './pages/ManufacturersPage';
import SalesOrderPage from './pages/SalesOrderPage';
import DispatchBoardPage from './pages/DispatchBoardPage';
import RetailerPortalPage from './pages/RetailerPortalPage';
import ManufacturerPortalPage from './pages/ManufacturerPortalPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import BlogPage from './pages/BlogPage';
import ChangelogPage from './pages/ChangelogPage';
import DownloadPage from './pages/DownloadPage';
import ClientOnboardingPage from './pages/ClientOnboardingPage';
import OnlineOrdersPage from './pages/OnlineOrdersPage';
import { OnlineDashboardPage } from './pages/OnlineDashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ManageRolesPage from './pages/ManageRolesPage';
import B2BInvoicePage from './pages/B2BInvoicePage';
import GSTReportsPage from './pages/GSTReportsPage';
import QuotationsPage from './pages/QuotationsPage';
import PaymentRemindersPage from './pages/PaymentRemindersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import DeliveryChallansPage from './pages/DeliveryChallansPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import WarehousePage from './pages/WarehousePage';
import InventoryBatchPage from './pages/InventoryBatchPage';
import BarcodePage from './pages/BarcodePage';
import PricingPage from './pages/PricingPage';
import PaymentLinkPage from './pages/PaymentLinkPage';
import PaymentLandingPage from './pages/PaymentLandingPage';
import OfflineBanner from './components/OfflineBanner';
import AIAdvisorPage from './pages/AIAdvisorPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { AppScreen } from './contexts/AuthContext';
import { SchemaProvider } from './contexts/SchemaContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';

function Layout({ children }: { children: React.ReactNode, currentTheme: 'light' | 'dark', toggleTheme: () => void }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { currentUser, userRole, tenantData, permissions, logout } = useAuth();
  const [adminExpanded, setAdminExpanded] = useState(true);

  const publicPaths = ['/', '/login', '/about', '/privacy', '/terms', '/blog', '/changelog', '/download'];
  if (publicPaths.includes(location.pathname)) return <>{children}</>;

  // Role-specific portal paths — no sidebar needed, standalone layout
  const portalPaths = ['/retailer-portal', '/manufacturer-portal'];
  if (portalPaths.some(p => location.pathname.startsWith(p))) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-base)' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-raised)' }}>
          <h2 className="primary-gradient-text" style={{ fontSize: '1.2rem', margin: 0 }}>
            {tenantData?.businessName || 'KaranArjun'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <LanguageSwitcher />
            {currentUser && (
              <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-secondary)', font: 'inherit', fontSize: '0.875rem' }}>
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>
        <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>{children}</main>
      </div>
    );
  }

  const isOwner = userRole === 'admin' || userRole === 'analyst';

  const mainNavItems = [
    { path: '/dashboard', icon: <Home size={19} />, label: 'B2B Dashboard', screenKey: 'dashboard' },
    { path: '/b2c-dashboard', icon: <BarChart3 size={19} />, label: 'B2C Dashboard', screenKey: 'b2c_dashboard' },
    { path: '/online-dashboard', icon: <Activity size={19} />, label: 'Online Dashboard', screenKey: 'online_dashboard' },
    { path: '/analytics', icon: <Layers size={19} />, label: 'Master Analytics', screenKey: 'analytics' },
    { path: '/onboarding', icon: <UserPlus size={19} />, label: t('common.retailers'), screenKey: 'retailers' },
    { path: '/worklist', icon: <ReceiptText size={19} />, label: t('common.worklist'), screenKey: 'worklist' },
    { path: '/dispatch', icon: <Truck size={19} />, label: 'Dispatch Board', screenKey: 'dispatch' },
    { path: '/pos', icon: <Calculator size={19} />, label: t('common.pos_billing'), screenKey: 'pos' },
    { path: '/b2b-invoice', icon: <ReceiptText size={19} />, label: 'B2B GST Invoice', screenKey: 'worklist' },
    { path: '/quotations', icon: <ClipboardList size={19} />, label: 'Quotations', screenKey: 'worklist' },
    { path: '/payment-reminders', icon: <Bell size={19} />, label: 'Payment Reminders', screenKey: 'worklist' },
    { path: '/purchase-orders', icon: <ShoppingCart size={19} />, label: 'Purchase Orders', screenKey: 'worklist' },
    { path: '/delivery-challans', icon: <Truck size={19} />, label: 'Delivery Challans', screenKey: 'worklist' },
    { path: '/gst-reports', icon: <FileText size={19} />, label: 'GST Reports', screenKey: 'analytics' },
    { path: '/financial-reports', icon: <BarChart3 size={19} />, label: 'Financial Reports', screenKey: 'analytics' },
    { path: '/warehouses', icon: <Layers size={19} />, label: 'Warehouses / Godowns', screenKey: 'inventory' },
    { path: '/inventory-batches', icon: <Package size={19} />, label: 'Inventory Batches', screenKey: 'inventory' },
    { path: '/barcode', icon: <Activity size={19} />, label: 'Barcode Labels', screenKey: 'inventory' },
    { path: '/pricing', icon: <Star size={19} />, label: '⭐ Upgrade Plan', screenKey: 'analytics' },
    { path: '/payment-links', icon: <Link2 size={19} />, label: '💳 Payment Links', screenKey: 'worklist' },
    { path: '/ai-advisor', icon: <Bot size={19} />, label: '🤖 AI Advisor', screenKey: 'analytics' },
    { path: '/rates', icon: <Package size={19} />, label: t('common.inventory'), screenKey: 'inventory' },
    { path: '/order-history', icon: <ReceiptText size={19} />, label: 'Order History', screenKey: 'order_history' },
    { path: '/online-orders', icon: <ShoppingCart size={19} />, label: 'Online Orders', screenKey: 'online_orders' },
  ];

  const navItems = mainNavItems.filter(item => {
    if (!isOwner) return false;
    if (userRole && permissions && !permissions[userRole]?.[item.screenKey as AppScreen]) return false;
    return true;
  });

  const adminItems = [
    { path: '/admin/manage-roles', icon: <ShieldAlert size={17} />, label: 'Role Matrix', screenKey: 'admin' },
    { path: '/admin/manage-retailers', icon: <Users size={17} />, label: t('common.manage_retailers'), screenKey: 'manage_retailers' },
    { path: '/admin', icon: <ShieldAlert size={17} />, label: t('common.manage_users'), screenKey: 'admin' },
    { path: '/admin/manufacturers', icon: <Factory size={17} />, label: 'Manufacturers', screenKey: 'manufacturers' },
    { path: '/admin/manage-store', icon: <Store size={17} />, label: 'Manage Store', screenKey: 'manage_store' },
    { path: '/admin/invoice-templates', icon: <Layers size={17} />, label: 'Invoice Templates', screenKey: 'invoice_templates' },
    { path: '/admin/invoice-settings', icon: <Palette size={17} />, label: 'Invoice Branding', screenKey: 'invoice_settings' },
    { path: '/admin/schema-builder', icon: <Database size={17} />, label: 'UI Layout Builder', screenKey: 'schema_builder' },
    { path: '/settings', icon: <Settings size={17} />, label: t('common.settings'), screenKey: 'settings' },
  ].filter(item => {
    if (userRole && permissions && !permissions[userRole]?.[item.screenKey as AppScreen]) return false;
    return true;
  });

  const isAdminPath = adminItems.some(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'));

  const navLinkStyle = (path: string, accent = 'primary') => {
    const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    const acColor = accent === 'secondary' ? 'var(--secondary-dark)' : 'var(--primary-light)';
    const acBg = accent === 'secondary' ? 'hsla(45,93%,47%,0.1)' : 'hsla(152,60%,40%,0.1)';
    return {
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: '0.875rem',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      color: active ? acColor : 'var(--text-tertiary)',
      background: active ? acBg : 'transparent',
      textDecoration: 'none' as const,
      fontWeight: active ? 600 : 400,
      fontSize: '0.9rem',
      transition: 'all var(--transition-fast)',
      borderLeft: active ? `3px solid ${acColor}` : '3px solid transparent',
    };
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav style={{ width: '265px', minWidth: '265px', background: 'var(--surface-base)', borderRight: '1px solid var(--surface-border)', padding: '1.5rem 1.1rem', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Brand */}
        <div style={{ padding: '0 0.5rem 1.25rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '1rem' }}>
          <h2 className="primary-gradient-text" style={{ fontSize: '1.35rem', marginBottom: '0.15rem', letterSpacing: '-0.03em' }}>
            {tenantData?.businessName || 'KaranArjun'}
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
            {tenantData?.location || 'Retailer Management'}
          </p>
          <div style={{ marginTop: '0.75rem' }}>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Main Nav (owner only) */}
        {isOwner && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 1rem', marginBottom: '0.2rem' }}>Main</div>
            {navItems.map(item => (
              <Link key={(item as any).path} to={(item as any).path} style={navLinkStyle((item as any).path)}>
                <span style={{ opacity: 0.8 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Administration Section (admin only) */}
        {userRole === 'admin' && (
          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => setAdminExpanded(e => !e)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: isAdminPath ? 'hsla(45,93%,47%,0.06)' : 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', marginBottom: '0.2rem' }}
            >
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isAdminPath ? 'var(--secondary-dark)' : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ⚙ Administration
              </span>
              <ChevronDown size={13} style={{ color: 'var(--text-tertiary)', transform: adminExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }} />
            </button>
            {adminExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', paddingLeft: '0.4rem' }}>
                {adminItems.map(item => (
                  <Link key={item.path} to={item.path} style={navLinkStyle(item.path, 'secondary')}>
                    <span style={{ opacity: 0.8 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Retailer quick nav */}
        {userRole === 'retailer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.25rem 1rem', marginBottom: '0.2rem' }}>My Portal</div>
            <Link to="/retailer-portal" style={navLinkStyle('/retailer-portal')}><Store size={19} /> My Account</Link>
          </div>
        )}

        {/* Logout */}
        {currentUser && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
            <button
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1rem', width: '100%', borderRadius: '10px', color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 400, font: 'inherit', fontSize: '0.9rem', transition: 'all var(--transition-fast)' }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'hsla(0,84%,60%,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={18} /> {t('common.logout')}
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('fiinny-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('fiinny-theme', theme);
    (window as any).__toggleTheme = toggleTheme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SchemaProvider>
            <ToastProvider>
              <Layout currentTheme={theme} toggleTheme={toggleTheme}>
                <AppRoutes />
              </Layout>
              <ToastContainer />
              <OfflineBanner />

            </ToastProvider>
          </SchemaProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )

}

function AppRoutes() {
  const { currentUser, tenantId, userRole, loading } = useAuth();
  const locationHook = useLocation();

  if (loading) return null;

  // Allow public store route without any auth redirect
  if (locationHook.pathname === '/store') {
    return (
      <Routes>
        <Route path="/store" element={<StorefrontPage />} />
      </Routes>
    );
  }

  // Role-based auto-redirect after login
  if (currentUser && tenantId) {
    if (userRole === 'retailer' && !locationHook.pathname.startsWith('/retailer-portal')) {
      return <Navigate to="/retailer-portal" replace />;
    }
    if (userRole === 'manufacturer' && !locationHook.pathname.startsWith('/manufacturer-portal')) {
      return <Navigate to="/manufacturer-portal" replace />;
    }
  }

  if (currentUser && !tenantId && locationHook.pathname !== '/client-onboarding') {
    return <Navigate to="/client-onboarding" replace />;
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/store" element={<StorefrontPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/download" element={<DownloadPage />} />

      {/* Onboarding */}
      <Route path="/client-onboarding" element={<ProtectedRoute><ClientOnboardingPage /></ProtectedRoute>} />

      {/* Retailer Portal */}
      <Route path="/retailer-portal" element={<ProtectedRoute requireRole={['retailer']}><RetailerPortalPage /></ProtectedRoute>} />

      {/* Manufacturer Portal */}
      <Route path="/manufacturer-portal" element={<ProtectedRoute requireRole={['manufacturer']}><ManufacturerPortalPage /></ProtectedRoute>} />

      {/* Owner / Analyst Routes */}
      <Route path="/dashboard" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="dashboard"><DashboardPage /></ProtectedRoute>} />
      <Route path="/b2c-dashboard" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="b2c_dashboard"><B2CDashboardPage /></ProtectedRoute>} />
      <Route path="/online-dashboard" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="online_dashboard"><OnlineDashboardPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="analytics"><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/admin/manage-store" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="manage_store"><AdminStoreProductsPage /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="retailers"><OnboardingPage /></ProtectedRoute>} />
      <Route path="/worklist" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><WorklistPage /></ProtectedRoute>} />
      <Route path="/worklist/:id" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><WorklistDetailsPage /></ProtectedRoute>} />
      <Route path="/sales-order/new" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><SalesOrderPage /></ProtectedRoute>} />
      <Route path="/sales-order/:id" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><SalesOrderPage /></ProtectedRoute>} />
      <Route path="/dispatch" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="dispatch"><DispatchBoardPage /></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="pos"><POSPage /></ProtectedRoute>} />
      <Route path="/b2b-invoice" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><B2BInvoicePage /></ProtectedRoute>} />
      <Route path="/quotations" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><QuotationsPage /></ProtectedRoute>} />
      <Route path="/payment-reminders" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><PaymentRemindersPage /></ProtectedRoute>} />
      <Route path="/purchase-orders" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><PurchaseOrdersPage /></ProtectedRoute>} />
      <Route path="/delivery-challans" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><DeliveryChallansPage /></ProtectedRoute>} />
      <Route path="/gst-reports" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="analytics"><GSTReportsPage /></ProtectedRoute>} />
      <Route path="/financial-reports" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="analytics"><FinancialReportsPage /></ProtectedRoute>} />
      <Route path="/warehouses" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="inventory"><WarehousePage /></ProtectedRoute>} />
      <Route path="/inventory-batches" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="inventory"><InventoryBatchPage /></ProtectedRoute>} />
      <Route path="/barcode" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="inventory"><BarcodePage /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="analytics"><PricingPage /></ProtectedRoute>} />
      <Route path="/payment-links" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="worklist"><PaymentLinkPage /></ProtectedRoute>} />
      <Route path="/ai-advisor" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="analytics"><AIAdvisorPage /></ProtectedRoute>} />
      {/* Public payment page */}
      <Route path="/pay/:token" element={<PaymentLandingPage />} />
      <Route path="/rates" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="inventory"><RateSheetPage /></ProtectedRoute>} />
      <Route path="/order-history" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="order_history"><OrderHistoryPage /></ProtectedRoute>} />
      <Route path="/online-orders" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="online_orders"><OnlineOrdersPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute appScreen="settings"><SettingsPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requireRole={['admin']} appScreen="admin"><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/manage-roles" element={<ProtectedRoute requireRole={['admin']} appScreen="admin"><ManageRolesPage /></ProtectedRoute>} />
      <Route path="/admin/manage-retailers" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="manage_retailers"><ManageRetailersPage /></ProtectedRoute>} />
      <Route path="/admin/manufacturers" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="manufacturers"><ManufacturersPage /></ProtectedRoute>} />
      <Route path="/admin/invoice-settings" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="invoice_settings"><InvoiceSettingsPage /></ProtectedRoute>} />
      <Route path="/admin/schema-builder" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="schema_builder"><SchemaBuilderPage /></ProtectedRoute>} />
      <Route path="/admin/invoice-templates" element={<ProtectedRoute requireRole={['admin', 'analyst']} appScreen="invoice_templates"><InvoiceTemplateBuilderPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App
