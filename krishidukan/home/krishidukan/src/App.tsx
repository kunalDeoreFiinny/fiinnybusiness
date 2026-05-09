/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ICONS } from './constants';
import HomeView from './views/HomeView';
import MarketView from './views/MarketView';
import HubView from './views/HubView';
import ProductDetailView from './views/ProductDetailView';
import StoreLocatorView from './views/StoreLocatorView';
import AboutView from './views/AboutView';
import { motion, AnimatePresence } from 'motion/react';

type View = 'home' | 'market' | 'hub' | 'orders' | 'product' | 'map' | 'about';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('Pune, Maharashtra');

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
        return <HomeView onProductClick={navigateToProduct} onHubClick={() => setCurrentView('hub')} />;
      case 'market':
        return <MarketView onProductClick={navigateToProduct} />;
      case 'hub':
        return <HubView />;
      case 'product':
        return <ProductDetailView productId={selectedProductId} onBack={() => setCurrentView('market')} onStoreClick={navigateToMap} />;
      case 'map':
        return <StoreLocatorView onBack={() => setCurrentView('home')} selectedStoreId={selectedStoreId} />;
      case 'about':
        return <AboutView />;
      default:
        return <HomeView onProductClick={navigateToProduct} onHubClick={() => setCurrentView('hub')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-container shadow-sm px-4 py-3 md:px-10 flex justify-between items-center transition-colors">
        <div 
          className="font-bold text-2xl text-primary tracking-tight cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setCurrentView('home')}
        >
          Krishidukan
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { id: 'home', label: 'Home' },
            { id: 'market', label: 'Market' },
            { id: 'hub', label: 'Hub' },
            { id: 'orders', label: 'Orders' },
            { id: 'about', label: 'About' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`text-sm font-semibold transition-colors hover:text-primary ${
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

        <div className="flex items-center gap-3">
          {/* Location search for nearby stores */}
          <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden shadow-sm group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <div className="flex items-center px-3 py-2 gap-2 flex-1">
              <ICONS.Location className="w-4 h-4 text-outline group-focus-within:text-primary transition-colors shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                className="bg-transparent border-none w-44 focus:ring-0 text-sm text-on-surface font-semibold"
              />
            </div>
            <button
              onClick={() => setCurrentView('map')}
              className="bg-primary text-white font-bold px-4 py-2 text-sm hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <ICONS.Search className="w-3.5 h-3.5" /> Find Stores
            </button>
          </div>

          <button
            className="p-2 hover:bg-surface-container rounded-full transition-colors text-primary md:hidden"
            onClick={() => setCurrentView('map')}
          >
            <ICONS.Location className="w-5 h-5" />
          </button>
          
          <button className="p-2 hover:bg-surface-container rounded-full transition-colors relative text-primary">
            <ICONS.Cart className="w-5 h-5" />
            <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">2</span>
          </button>
          
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer hover:border-primary transition-colors">
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
          { id: 'orders', icon: ICONS.Orders, label: 'Orders' },
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
