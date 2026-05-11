import { MarketplaceProduct } from "../../types/product";
import { ICONS, STORES } from '../constants';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface StoreLocatorViewProps {
  onBack: () => void;
  selectedStoreId?: string | null;
}

export default function StoreLocatorView({ onBack, selectedStoreId }: StoreLocatorViewProps) {
  const focusedStore = STORES.find(s => s.id === selectedStoreId) || STORES[0];
  const [location, setLocation] = useState('Pune, Maharashtra');

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-[400px] bg-white border-r border-surface-container flex flex-col z-20 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-surface-container shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-surface-container-low rounded-full md:hidden">
              <ICONS.ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h2 className="text-2xl font-bold text-on-surface">Nearby Stores</h2>
          </div>

          {/* Location search — only on this tab */}
          <div className="flex items-center bg-surface-container-low rounded-2xl px-4 py-3 mb-4 border border-outline-variant group focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <ICONS.Location className="w-4 h-4 text-outline mr-3 group-focus-within:text-primary transition-colors shrink-0" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Enter your location..."
              className="bg-transparent border-none w-full focus:ring-0 text-sm text-on-surface font-semibold placeholder:font-normal"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
              <ICONS.Check className="w-4 h-4" /> Open Now
            </button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full border border-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-container-low">
              Urea In-Stock
            </button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full border border-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-container-low">
              NPK Fertilizer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-surface-container-lowest">
          {STORES.map((store, i) => (
            <motion.div 
              key={store.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.02] ${
                store.id === selectedStoreId ? 'border-primary bg-primary/10 shadow-lg scale-[1.03]' : (store.isHot ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-surface-container bg-white hover:border-outline-variant shadow-sm')
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`text-xl font-bold ${store.id === selectedStoreId || store.isHot ? 'text-primary' : 'text-on-surface'}`}>{store.name}</h3>
                  <p className="flex items-center gap-1 text-xs font-bold text-on-surface-variant mt-1">
                    <ICONS.Location className="w-3 h-3" /> {store.distance}
                  </p>
                </div>
                {(store.id === selectedStoreId || store.isHot) && (
                  <span className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    {store.id === selectedStoreId ? 'Selected' : 'Closest'}
                  </span>
                )}
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${store.status.includes('Open') ? 'bg-green-500' : 'bg-error'}`} />
                  <span className="text-xs font-bold text-on-surface-variant">{store.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {store.stock.map(item => (
                    <span key={item} className="px-2 py-0.5 rounded-lg bg-surface-container-high text-on-surface-variant text-[9px] font-black uppercase tracking-widest border border-surface-container-highest">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`flex gap-2 transition-all duration-300 ${store.id === selectedStoreId ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                <button className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <ICONS.Directions className="w-4 h-4" /> Get Directions
                </button>
                <button className="flex-1 border border-outline-variant text-on-surface py-2.5 rounded-xl text-xs font-bold hover:bg-white transition-colors">
                  Details
                </button>
              </div>
            </motion.div>
          ))}
          <div className="h-20" />
        </div>
      </div>

      {/* Map Content */}
      <div className="hidden md:block flex-1 relative bg-surface-container-high overflow-hidden">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyfMGjwhtw8rcz0nJdJShXXwGD5wnhbktKM9IIi4mJN93_oRQIzploWgg_TNkZ3F5J3C9SS5_RfQKACkRE6YJiZsH5f1PyDDD0kujQFu0R-RqP3v4aX_F5fatLcyE-ryLEG_I9JbWTY_zy0u1xnkMbVNDcf30VtdVN1B1tlFe6aorqvfQfKFmh5frVVrXV1uLEpIOLvMjTg1pXC7KKxivijAdwlxRC6xRVaB56Pqf37xnSFf5zLZFAAKM5bb6NkS3C4bmljQpO2tFR" 
          alt="Map"
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Map UI */}
        <div className="absolute top-10 right-10 flex flex-col gap-4">
          <button className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary hover:scale-110 active:scale-90 transition-all border border-surface-container group">
            <ICONS.MyPosition className="w-6 h-6 group-hover:animate-pulse" />
          </button>
          <div className="flex flex-col bg-white rounded-3xl shadow-xl border border-surface-container overflow-hidden">
            <button className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors border-b border-surface-container">
              <ICONS.Plus className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
              <ICONS.Minus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Custom Marker (Simulated) */}
        <motion.div 
          key={focusedStore.id}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-[45%] left-[55%] -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group cursor-pointer"
        >
          <div className="bg-white px-4 py-2 rounded-2xl shadow-2xl mb-2 whitespace-nowrap border-2 border-primary transform group-hover:-translate-y-1 transition-transform">
            <span className="text-sm font-black text-on-surface uppercase tracking-tight">{focusedStore.name}</span>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full border-4 border-white flex items-center justify-center shadow-xl text-white">
            <ICONS.Market className="w-5 h-5" />
          </div>
          <div className="w-1.5 h-6 bg-primary rounded-full -mt-1 shadow-lg" />
          <div className="w-6 h-2 bg-black/10 rounded-full blur-[2px] mt-1 scale-x-150 animate-pulse" />
        </motion.div>

        {/* User Location */}
        <div className="absolute top-[60%] left-[40%] z-20 flex flex-col items-center">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg" />
          <div className="w-20 h-20 bg-blue-500/20 rounded-full absolute -top-7 blur-md animate-ping" />
        </div>
      </div>
    </div>
  );
}
