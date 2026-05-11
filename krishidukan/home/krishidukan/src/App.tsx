/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ICONS, PRODUCTS } from './constants';
import HomeView from './views/HomeView';
import MarketView from './views/MarketView';
import HubView from './views/HubView';
import ProductDetailView from './views/ProductDetailView';
import StoreLocatorView from './views/StoreLocatorView';
import ProfileView from './views/ProfileView';
import AboutView from './views/AboutView';
import { motion, AnimatePresence } from 'motion/react';
import { fetchMarketplaceProducts, MarketplaceProduct } from './firebase';

type View = 'home' | 'market' | 'hub' | 'product' | 'map' | 'about' | 'profile';
type UserRole = 'customer' | 'retailer';
type UserProfile = {
  name: string;
  phone: string;
  email: string;
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('Pune, Maharashtra');
  const [productSearch, setProductSearch] = useState('');
  const [language, setLanguage] = useState('EN');
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', phone: '', email: '' });
  const [retailerProducts, setRetailerProducts] = useState<MarketplaceProduct[]>([]);

  const allProducts = [...PRODUCTS, ...retailerProducts];

  const loadRetailerProducts = async () => {
    try {
      const items = await fetchMarketplaceProducts();
      setRetailerProducts(items);
    } catch (error) {
      console.error('Failed to load retailer products:', error);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('krishidukan-user-role');
    const savedProfile = localStorage.getItem('krishidukan-user-profile');
    if (savedRole === 'customer' || savedRole === 'retailer') {
      setUserRole(savedRole);
    }
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as UserProfile;
        setUserProfile(parsed);
      } catch (error) {
        console.error('Failed to parse saved user profile:', error);
      }
    }
    void loadRetailerProducts();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('krishidukan-user-role', role);
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('krishidukan-user-profile', JSON.stringify(profile));
  };

  const navigateToProduct = (id: string) => {
    setSelectedProductId(id);
    setCurrentView('product');
  };

  const navigateToMap = (storeId?: string) => {
    setSelectedStoreId(storeId || null);
    setCurrentView('map');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView products={allProducts} onProductClick={navigateToProduct} onHubClick={() => setCurrentView('hub')} />;
      case 'market':
        return <MarketView products={allProducts} onProductClick={navigateToProduct} />;
      case 'hub':
        return <HubView />;
      case 'product':
        return <ProductDetailView products={allProducts} productId={selectedProductId} onBack={() => setCurrentView('market')} onStoreClick={navigateToMap} />;
      case 'map':
        return <StoreLocatorView onBack={() => setCurrentView('home')} selectedStoreId={selectedStoreId} />;
      case 'profile':
        return (
          <ProfileView
            role={userRole}
            profile={userProfile}
            onRoleChange={handleRoleChange}
            onProfileSave={handleProfileSave}
            onRetailerProductSaved={loadRetailerProducts}
          />
        );
      case 'about':
        return <AboutView />;
      default:
        return <HomeView products={allProducts} onProductClick={navigateToProduct} onHubClick={() => setCurrentView('hub')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-container shadow-sm px-4 py-2 md:px-6 flex justify-between items-center transition-colors gap-4">
        <div 
          className="font-bold text-xl text-primary tracking-tight cursor-pointer hover:scale-105 transition-transform shrink-0"
          onClick={() => setCurrentView('home')}
        >
          Krishidukan
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {[
            { id: 'home', label: 'Home' },
            { id: 'market', label: 'Market' },
            { id: 'hub', label: 'Hub' },
            { id: 'map', label: 'Stores' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`text-xs font-semibold transition-colors hover:text-primary whitespace-nowrap ${
                currentView === item.id ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {item.label}
              {currentView === item.id && (
                <motion.div layoutId="activeTab" className="h-0.5 bg-primary mt-0.5 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Product Search Bar */}
          <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex-1 max-w-sm">
            <ICONS.Search className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors shrink-0 ml-3" />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface px-2 py-2 placeholder-on-surface-variant font-medium"
            />
          </div>
        </div>
          
        <div className="flex items-center gap-2 shrink-0">
          {/* Current Location Display */}
          <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl shadow-sm px-2 py-1.5 gap-1.5">
            <ICONS.Location className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs text-on-surface font-semibold truncate max-w-[120px]">{locationQuery}</span>
          </div>

          <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl px-2 py-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-on-surface focus:ring-0 pr-5 cursor-pointer"
              aria-label="Select language"
            >
              <option value="EN">EN</option>
              <option value="HI">HI</option>
              <option value="MR">MR</option>
            </select>
          </div>

          <button
            className="p-1.5 hover:bg-surface-container rounded-full transition-colors text-primary md:hidden"
            onClick={() => setCurrentView('map')}
          >
            <ICONS.Location className="w-5 h-5" />
          </button>

          <button className="p-1.5 hover:bg-surface-container rounded-full transition-colors relative text-primary">
            <ICONS.Cart className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 bg-secondary text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">2</span>
          </button>
          
          <div
            className="w-7 h-7 rounded-full overflow-hidden border border-outline-variant cursor-pointer hover:border-primary transition-colors"
            onClick={() => setCurrentView('profile')}
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwu2tK62uBNx8gSF2_Y7xXctwg1gU4uMZwYKtUu0CtR284mgV0EtsVT3FZ9XpY9PZcfLq14DMlYnCult-Ov6-dnfp6gCJXMAF4UESW2oYc51Cn20GjPms6L77SMQv3RGQNC0ZWoinA4OX1-_G6HxIU-lzahWMaHzIjigR0W1nn7OzMTbDfDXF0PJrPjgVKUkUOc5kH2kj3oJmWrDnKDYAQngtfEs8nG1Uxaw9avdCRjz7t2C6JT1S5rddh2Cve2JuYPILT0qavRjTF" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-surface-container flex items-center justify-around px-4 z-50">
        {[
          { id: 'home', icon: ICONS.Home, label: 'Home' },
          { id: 'market', icon: ICONS.Market, label: 'Market' },
          { id: 'hub', icon: ICONS.Hub, label: 'Hub' },
          { id: 'map', icon: ICONS.Location, label: 'Stores' },
          { id: 'about', icon: ICONS.Info, label: 'About' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentView === item.id ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            {currentView === item.id && (
              <motion.div 
                layoutId="activeBubble" 
                className="absolute -z-10 w-12 h-12 bg-primary-container/20 rounded-full"
                initial={false}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
