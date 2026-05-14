import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  Search, MapPin, Home, Store, X, ShoppingCart, ChevronDown,
  CircleUser, Clock3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../LocationContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { LocationPickerModal } from './LocationPickerModal';
import { OfflineBanner } from './OfflineBanner';
import { BrandMarkIcon } from './icons';
import { LanguageSwitcher } from './LanguageSwitcher';

const HEADER_HEIGHT = 68;
const TABBAR_HEIGHT = 64;

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useRouterLocation();
  const { location, shouldAutoPrompt } = useLocation();
  const { cartCount } = useCart();
  const { isAuthenticated, requireLogin } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [autoPromptHandled, setAutoPromptHandled] = useState(false);

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

  // TEMP_DISABLED: Cart feature disabled temporarily
  function goToCart() {
    // no-op — cart is disabled
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f8fa' }}>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: HEADER_HEIGHT, background: '#ffffff',
          borderBottom: '1px solid #eef0f3',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 16,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#111827', flexShrink: 0 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
          }}>
            <BrandMarkIcon size={20} color="#ffffff" strokeWidth={2.4} />
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{t('common.appName')}</span>
        </Link>

        <button
          onClick={() => setLocationPickerOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: '#111827',
            border: 'none', padding: '6px 10px',
            cursor: 'pointer', borderRadius: 10,
            minWidth: 0, maxWidth: 220,
          }}
        >
          <MapPin size={18} color="#16a34a" strokeWidth={2.2} />
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, lineHeight: 1.1 }}>
              <Clock3 size={11} strokeWidth={2.4} /> {t('nav.deliveryTo')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2, overflow: 'hidden' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{location.label}</span>
              <ChevronDown size={14} color="#6b7280" />
            </div>
          </div>
        </button>

        <form
          onSubmit={submitSearch}
          style={{
            flex: 1, display: 'none', alignItems: 'center', gap: 10,
            background: '#f3f4f6', borderRadius: 12, padding: '0 14px',
            height: 44, maxWidth: 520,
          }}
          className="kd-search-desktop"
        >
          <Search size={18} color="#6b7280" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('nav.searchPlaceholder')}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827' }}
          />
        </form>

        <div style={{ flex: 1 }} className="kd-search-spacer" />

        <button
          onClick={() => setSearchOpen(true)}
          aria-label={t('nav.searchAria')}
          className="kd-search-mobile"
          style={{
            background: '#f3f4f6', border: 'none', color: '#374151',
            padding: 9, cursor: 'pointer', borderRadius: 10, display: 'flex',
          }}
        >
          <Search size={18} />
        </button>

        {/* TEMP_DISABLED: Login/auth feature disabled — navigate directly */}
        <button
          onClick={() => navigate('/account')}
          aria-label={t('nav.account')}
          style={{
            background: 'transparent', border: 'none', color: '#111827',
            padding: 6, cursor: 'pointer', borderRadius: 10, display: 'none', alignItems: 'center', gap: 6,
          }}
          className="kd-login-desktop"
        >
          <CircleUser size={20} strokeWidth={1.8} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t('nav.account')}</span>
        </button>

        <LanguageSwitcher />

        {/* TEMP_DISABLED: Cart feature disabled temporarily */}
        <button
          disabled
          aria-label={t('nav.cartAria')}
          title="Coming Soon"
          style={{
            background: '#9ca3af', color: '#fff', border: 'none',
            padding: '8px 14px', cursor: 'not-allowed', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 6, position: 'relative',
            opacity: 0.6,
          }}
        >
          <ShoppingCart size={17} strokeWidth={2.1} />
          <span style={{ fontSize: 13, fontWeight: 700 }} className="kd-cart-label">Coming Soon</span>
        </button>

        <style>{`
          @media (min-width: 720px) {
            .kd-search-desktop { display: flex !important; }
            .kd-search-spacer { display: none !important; }
            .kd-search-mobile { display: none !important; }
            .kd-login-desktop { display: inline-flex !important; }
          }
          @media (max-width: 480px) {
            .kd-cart-label { display: none; }
          }
        `}</style>
      </header>

      <OfflineBanner />

      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 16px' }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitSearch}
            style={{ background: '#fff', borderRadius: 16, padding: 18, width: '100%', maxWidth: 520, boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f3f4f6', borderRadius: 12, padding: '10px 14px' }}>
              <Search size={18} color="#6b7280" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchModalPlaceholder')}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#111827' }}
              />
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{t('nav.trendingNow')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  t('nav.trendingChips.fertilizer'),
                  t('nav.trendingChips.fungicide'),
                  t('nav.trendingChips.bioStimulant'),
                  t('nav.trendingChips.rootDeveloper'),
                  t('nav.trendingChips.organic'),
                ].map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => { setSearchQuery(q); setTimeout(submitSearch, 0); }}
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '7px 14px', fontSize: 12, color: '#15803d', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        required={!autoPromptHandled && shouldAutoPrompt}
      />

      <main style={{ flex: 1, paddingBottom: TABBAR_HEIGHT + 16 }}>
        {children}
      </main>

      <nav
        className="kd-tabbar-mobile"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: TABBAR_HEIGHT,
          background: '#ffffff', borderTop: '1px solid #eef0f3',
          display: 'flex', alignItems: 'stretch', zIndex: 40,
          boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.04)',
        }}
      >
        {[
          { to: '/', icon: Home, label: t('nav.home') },
          { to: '/retailers', icon: Store, label: t('nav.shops') },
          { to: '/account', icon: CircleUser, label: t('nav.accountTab') },
        ].map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? router.pathname === '/' : router.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, textDecoration: 'none',
                color: active ? '#16a34a' : '#6b7280',
                fontSize: 11, fontWeight: 600,
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
              {label}
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 720px) {
          .kd-tabbar-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}
