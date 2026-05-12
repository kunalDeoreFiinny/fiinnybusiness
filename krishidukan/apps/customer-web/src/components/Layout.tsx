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
    { to: '/', label: 'Home' },
    { to: '/market', label: 'Market' },
    { to: '/hub', label: 'Hub' },
    { to: '/retailers', label: 'Stores' },
    { to: '/about', label: 'About' },
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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-container shadow-sm px-4 py-3 md:px-10 flex justify-between items-center transition-colors">
        <Link to="/" className="font-bold text-2xl text-primary tracking-tight hover:scale-105 transition-transform no-underline">
          Krishidukan
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-semibold transition-colors hover:text-primary no-underline relative ${isActive(item.to) ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              {item.label}
              {isActive(item.to) && (
                <motion.div layoutId="activeTab" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop Search/Location Bar */}
          <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <div className="flex items-center px-3 py-2 gap-2 flex-1">
              <MapPin className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors shrink-0" />
              <button 
                onClick={() => setLocationPickerOpen(true)}
                className="bg-transparent border-none text-left w-36 focus:ring-0 text-sm text-on-surface font-semibold truncate"
              >
                {location.label.split(',')[0]}
              </button>
            </div>
            <button
              onClick={() => navigate('/market')}
              className="bg-primary text-white font-bold px-4 py-2 text-sm hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" /> {t('common.browse')}
            </button>
          </div>

          <button
            onClick={() => setLocationPickerOpen(true)}
            className="p-2 hover:bg-surface-container rounded-full transition-colors text-primary md:hidden"
          >
            <MapPin className="w-5 h-5" />
          </button>

          <LanguageSwitcher />

          {/* Account */}
          <button
            onClick={() => requireLogin(() => navigate('/account'), 'generic')}
            className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant"
          >
            <CircleUser className="w-5 h-5" />
          </button>

          {/* Cart */}
          <button
            onClick={() => requireLogin(() => navigate('/cart'), 'add-to-cart')}
            className="relative p-2 hover:bg-surface-container rounded-full transition-colors text-primary"
          >
            <ShoppingCart className="w-5 h-5" />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-surface-container flex items-center justify-around px-4 z-50">
        {mobileNavItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 transition-colors relative no-underline ${isActive(item.to) ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.to) ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            {isActive(item.to) && (
              <motion.div 
                layoutId="activeBubble" 
                className="absolute -z-10 w-12 h-12 bg-primary-container/10 rounded-full"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
