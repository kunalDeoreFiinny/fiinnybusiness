import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Search, MapPin, Home, Store, X, ShoppingCart, CircleUser, ChevronDown, BrainCircuit, ReceiptText, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../LocationContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { LocationPickerModal } from './LocationPickerModal';
import { OfflineBanner } from './OfflineBanner';
import { LanguageSwitcher } from './LanguageSwitcher';
import { motion } from 'motion/react';

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
    if (shouldAutoPrompt) { setLocationPickerOpen(true); setAutoPromptHandled(true); }
  }, [shouldAutoPrompt, autoPromptHandled]);

  function submitSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  }

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/market', label: 'Market', icon: Store },
    { to: '/hub', label: 'Hub', icon: BrainCircuit },
    { to: '/retailers', label: 'Stores', icon: MapPin },
    { to: '/about', label: 'About', icon: Info },
  ];

  const mobileNavItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/market', label: 'Market', icon: Store },
    { to: '/hub', label: 'Hub', icon: BrainCircuit },
    { to: '/retailers', label: 'Stores', icon: MapPin },
    { to: '/account', label: 'Account', icon: CircleUser },
  ];

  function isActive(to: string) {
    return to === '/' ? router.pathname === '/' : router.pathname.startsWith(to);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-container shadow-sm px-4 py-3 md:px-8 flex justify-between items-center">
        <Link to="/" className="font-bold text-2xl text-primary tracking-tight hover:scale-105 transition-transform no-underline">
          Krishidukan
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-semibold transition-colors hover:text-primary no-underline flex flex-col items-center ${isActive(item.to) ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              {item.label}
              {isActive(item.to) && <motion.div layoutId="activeTab" className="h-0.5 bg-primary mt-0.5 rounded-full w-full" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Location button */}
          <button
            onClick={() => setLocationPickerOpen(true)}
            className="hidden md:flex items-center gap-1 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm font-semibold text-on-surface hover:border-primary transition-all max-w-[200px]"
          >
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{location.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-outline shrink-0" />
          </button>

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant"
          >
            <Search className="w-5 h-5" />
          </button>

          <LanguageSwitcher />

          {/* Account */}
          <button
            onClick={() => requireLogin(() => navigate('/account'), 'generic')}
            className="p-2 hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant"
          >
            <CircleUser className="w-5 h-5" />
          </button>

          {/* Cart */}
          <button
            onClick={() => requireLogin(() => navigate('/cart'), 'add-to-cart')}
            className="relative p-2 bg-primary text-white rounded-xl hover:bg-primary-container transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-harvest text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <OfflineBanner />

      {/* Search Modal */}
      {searchOpen && (
        <div onClick={() => setSearchOpen(false)} className="fixed inset-0 bg-black/50 z-[100] flex items-start justify-center pt-16 px-4">
          <form onClick={(e) => e.stopPropagation()} onSubmit={submitSearch} className="bg-white rounded-3xl p-5 w-full max-w-lg shadow-2xl">
            <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl px-4 py-3 border border-outline-variant focus-within:border-primary">
              <Search className="w-5 h-5 text-outline shrink-0" />
              <input
                autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for fertilizers, seeds, tools..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface font-medium"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-outline hover:text-on-surface transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Trending Now</p>
              <div className="flex flex-wrap gap-2">
                {['NPK Fertilizer', 'Urea', 'Bio Stimulant', 'Root Developer', 'Organic'].map((q) => (
                  <button key={q} type="button" onClick={() => { setSearchQuery(q); setTimeout(() => submitSearch(), 0); }}
                    className="bg-surface-container-low border border-outline-variant rounded-full px-4 py-1.5 text-xs font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      <LocationPickerModal open={locationPickerOpen} onClose={() => setLocationPickerOpen(false)} required={!autoPromptHandled && shouldAutoPrompt} />

      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-surface-container flex items-center justify-around px-2 z-50">
        {mobileNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors no-underline ${isActive(item.to) ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <item.icon className="w-5 h-5" strokeWidth={isActive(item.to) ? 2.4 : 1.9} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
