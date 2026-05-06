import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Search, MapPin, Home, Grid3x3, Store, User, LocateFixed, X } from 'lucide-react';
import { useLocation } from '../LocationContext';

const HEADER_HEIGHT = 60;
const TABBAR_HEIGHT = 60;

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const router = useRouterLocation();
  const { location, requesting, requestGps } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
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
          <span style={{ fontSize: 22 }}>🌾</span>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>KrishiDukan</span>
        </Link>

        {/* Location pill — desktop visible always; mobile only on home */}
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

        {/* Search button (mobile) / search bar inline (wide) */}
        <button
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          style={{ background: 'transparent', border: 'none', color: '#fff', padding: 8, cursor: 'pointer', borderRadius: 8 }}
        >
          <Search size={20} />
        </button>
      </header>

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
      {locationPickerOpen && (
        <div
          onClick={() => setLocationPickerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Choose Location</h3>
              <button onClick={() => setLocationPickerOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              We'll use this to find shops near you.
            </p>
            <button
              disabled={requesting}
              onClick={() => { requestGps(); setLocationPickerOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}
            >
              <LocateFixed size={16} />
              {requesting ? 'Getting location…' : 'Use my current location'}
            </button>
            <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
              Currently: <strong style={{ color: '#374151' }}>{location.label}</strong>
            </p>
          </div>
        </div>
      )}

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
          { to: '/', icon: Home, label: 'Home' },
          { to: '/categories', icon: Grid3x3, label: 'Categories' },
          { to: '/shops', icon: Store, label: 'Shops' },
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
