import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar, { Footer } from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Blog from './pages/Blog';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Technical from './pages/Technical';
import Benefits from './pages/Benefits';
import Admin from './pages/Admin';
import About from './pages/About';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProtectedRoute } from './components/ProtectedRoute';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHideNavbarFooter = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
      {!isHideNavbarFooter && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isHideNavbarFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <LayoutWrapper>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/blog" element={<Blog />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="/technical" element={<Technical />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
            </Routes>
            <CartDrawer />
            <CheckoutModal />
          </LayoutWrapper>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
