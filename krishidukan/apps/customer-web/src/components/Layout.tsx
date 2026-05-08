import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Search, MapPin, Home, Store, User, X, ShoppingCart } from 'lucide-react';
import { useLocation } from '../LocationContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { LocationPickerModal } from './LocationPickerModal';
import { OfflineBanner } from './OfflineBanner';

const HEADER_HEIGHT = 60;
const TABBAR_HEIGHT = 60;

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const router = useRouterLocation();
  const { location, shouldAutoPrompt } = useLocation();
  const { cartCount } = useCart();
  const { isAuthenticated, requireLogin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [autoPromptHandled, setAutoPromptHandled] = useState(false);

  // First-open prompt (F1) — open the picker once when the user has no chosen location.
  useEffect(() => {
    if (autoPromptHandled) return;
    if (shouldAutoPrompt) {
      setLocationPickerOpen(true);
      setAutoPromptHandled(true);
    }
  }, [shouldAutoPrompt, autoPromptHandled]);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  }

  function goToCart() {
    requireLogin(() => navigate('/cart'), 'add-to-cart');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: HEADER_HEIGHT, background: '#16a34a',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff', flexShrink: 0 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.1 }}>KaranArjun</div>
            <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.85, letterSpacing: '0.04em' }}>PowerPlus</div>
          </div>
        </Link>

        <button
          onClick={() => setLocationPickerOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.18)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 20, padding: '5px 12px',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 160,
          }}
        >
          <MapPin size={13} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {location.label}
          </span>
        </button>

        <div style={{ flex: 1 }} />

        {/* Cart icon (mobile-friendly tap target) */}
        <button
          onClick={goToCart}
          aria-label="Cart"
          style={{ background: 'transparent', border: 'none', color: '#fff', padding: 8, cursor: 'pointer', borderRadius: 8, position: 'relative' }}
        >
          <ShoppingCart size={20} />
          {isAuthenticated && cartCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              background: '#f59e0b', color: '#fff',
              fontSize: 10, fontWeight: 700, lineHeight: 1,
              padding: '2px 5px', borderRadius: 10, minWidth: 16, textAlign: 'center',
            }}>
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          style={{ background: 'transparent', border: 'none', color: '#fff', padding: 8, cursor: 'pointer', borderRadius: 8 }}
        >
          <Search size={20} />
        </button>
      </header>

      {/* Offline banner (sticky just below header) */}
      <OfflineBanner />

      {/* Search modal overlay */}
      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px' }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitSearch}
            style={{ background: '#fff', borderRadius: 14, padding: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={18} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search seeds, fertilizers, pesticides..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: '10px 0' }}
              />
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Cotton seeds', 'Urea', 'Glyphosate', 'Confidor', 'Drip irrigation'].map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => { setSearchQuery(q); setTimeout(submitSearch, 0); }}
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '6px 12px', fontSize: 12, color: '#15803d', cursor: 'pointer' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {/* Location picker modal */}
      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        required={!autoPromptHandled && shouldAutoPrompt}
      />

      {/* Main content */}
      <main style={{ flex: 1, paddingBottom: TABBAR_HEIGHT + 16 }}>
        {children}
      </main>

      {/* Bottom tab bar (mobile-first) */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: TABBAR_HEIGHT,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'stretch', zIndex: 40,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      }}>
        {[
          { to: '/', icon: Home, label: 'Products' },
          { to: '/retailers', icon: Store, label: 'Retailers' },
          { to: '/account', icon: User, label: 'Account' },
        ].map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? router.pathname === '/' : router.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, textDecoration: 'none',
                color: active ? '#16a34a' : '#6b7280',
                fontSize: 11, fontWeight: 500,
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
