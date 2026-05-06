import React, { Component } from 'react';
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

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
          <p className="font-sans text-lg font-semibold text-primary">Something went wrong loading this page.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-6 py-3 bg-primary text-white rounded-xl font-sans font-bold hover:bg-primary-container transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
