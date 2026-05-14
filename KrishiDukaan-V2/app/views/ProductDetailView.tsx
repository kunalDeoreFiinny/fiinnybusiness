import { MarketplaceProduct } from "../../types/product";
import { ICONS, PRODUCTS, STORES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

type StoreListItem = {
  id: string;
  name: string;
  distance?: string;
  status?: string;
  stock?: string[];
};

interface ProductDetailViewProps {
  products?: MarketplaceProduct[];
  stores?: StoreListItem[];
  productId: string | null;
  onBack: () => void;
  onStoreClick: (storeId: string) => void;
}

export default function ProductDetailView({ products = PRODUCTS, stores = STORES, productId, onBack, onStoreClick }: ProductDetailViewProps) {
  const product = products.find(p => p.id === productId) || products[0];
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

  const availabilityStoreIds = new Set((product.availability || []).map((item) => item.storeId));
  const matchingStores = stores.filter((store) => availabilityStoreIds.has(store.id));
  const availableStores = matchingStores.slice(0, 5);

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8 flex flex-col gap-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
        <button className="hover:text-primary transition-colors" onClick={onBack}>Market</button>
        <ICONS.ChevronRight className="w-3 h-3" />
        <span className="text-outline">{product.category}</span>
        <ICONS.ChevronRight className="w-3 h-3" />
        <span className="text-primary">{product.name}</span>
      </nav>

      {/* Top grid: image left, stores right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Left — Product image */}
        <div className="flex flex-col gap-4">
          <motion.div
            layoutId={`prod-img-${product.id}`}
            className="aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-ambient border border-surface-container relative"
          >
            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            <div className="absolute top-6 left-6 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
              <ICONS.Check className="w-4 h-4" />
              Premium Grade
            </div>
          </motion.div>
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl border-2 border-primary overflow-hidden cursor-pointer shadow-sm">
              <img src={product.image} className="w-full h-full object-cover" alt="thumb1" />
            </div>
            <div className="w-24 h-24 rounded-2xl border border-surface-container-highest overflow-hidden opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRy2KbS0xyVt7brjix_bSB7rxB4v7-foDeu7vBzhgbFNrZJwXRzXVQJIffFqGQN-xSvlGNa8GnrS4ej7VfxD6s7IdXzJbsi48RIR99heAy7LwMPJlXATrIo7Z_Hbh7nepdxevHns9C2UFx7XZ-MwcG8DQUEChNv7RfIr-Au9NoHXB1CkTBegc6gwZ6BjBVWrib4jdYGmBV6X1SNuftWfSkukjiJ1FjMfEfMp3RbOFzfiZ8wGfLGcxHfzWzeROMHKAh68-N5Oqavxuo" className="w-full h-full object-cover" alt="thumb2" />
            </div>
          </div>
        </div>

        {/* Right — Store cards (click to expand) */}
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-on-surface uppercase tracking-widest text-xs mb-1">Available at these Stores</h3>

          {availableStores.length > 0 ? availableStores.map(store => {
            const availability = product.availability?.find(a => a.storeId === store.id);
            const isExpanded = expandedStoreId === store.id;
            return (
              <div
                key={store.id}
                className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                  isExpanded ? 'border-primary bg-white shadow-ambient' : 'border-surface-container bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                {/* Always-visible summary row */}
                <button
                  onClick={() => setExpandedStoreId(isExpanded ? null : store.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${isExpanded ? 'bg-primary text-white' : 'bg-white shadow-sm text-on-surface-variant'}`}>
                    <ICONS.Market className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-on-surface truncate">{store.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                        <ICONS.Location className="w-3 h-3" />{store.distance || 'Nearby'}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${(store.status || '').includes('Open') ? 'bg-green-500' : 'bg-red-400'}`} />
                      <span className="text-[10px] font-bold text-on-surface-variant">{(store.status || 'Active').split('•')[0].trim()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      availability?.stockLevel === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {availability?.stockLevel}
                    </span>
                    <ICONS.ChevronRight className={`w-4 h-4 text-outline transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 flex flex-col gap-3 border-t border-surface-container">
                        <div className="pt-3 flex flex-wrap gap-1">
                          {(store.stock || []).map(item => (
                            <span key={item} className="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant text-[9px] font-black uppercase tracking-widest border border-surface-container-highest">
                              {item}
                            </span>
                          ))}
                          {(store.stock || []).length === 0 && (
                            <span className="text-xs text-on-surface-variant">No stock info available</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onStoreClick(store.id)}
                            className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <ICONS.Directions className="w-3.5 h-3.5" /> View on Map
                          </button>
                          <button className="flex-1 border border-outline-variant text-on-surface py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5">
                            <ICONS.Phone className="w-3.5 h-3.5" /> Call Store
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }) : (
            <div className="p-4 rounded-2xl border-2 border-dashed border-surface-container text-center text-on-surface-variant text-sm">
              Only available for home delivery.
            </div>
          )}

          {/* Delivery option */}
          <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-surface-container hover:border-primary transition-all bg-surface-container-low group cursor-pointer">
            <div className="p-2.5 rounded-xl bg-white shadow-sm text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-colors">
              <ICONS.Delivery className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-bold text-on-surface">Deliver to Farm</span>
              <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant">Arrival Tomorrow, 10 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Below — Product details */}
      <div className="bg-white rounded-3xl border border-surface-container shadow-sm p-6 md:p-8 flex flex-col gap-6">
        {/* Name + badges */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-secondary/20">Organic Certified</span>
            <div className="flex items-center gap-1 text-secondary">
              <ICONS.Star className="w-4 h-4 fill-secondary" />
              <span className="text-sm font-black">4.8 (124 Reviews)</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight">{product.fullName || product.name}</h1>
          <p className="text-on-surface-variant leading-relaxed">
            {product.description} Balanced nutrition for all stages of crop growth. Ensures robust vegetative development, better root systems, and higher yields.
          </p>
        </div>

        {/* Price + quantity + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4 border-t border-surface-container">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-extrabold text-secondary tracking-tight">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-xl text-on-surface-variant line-through mb-1">₹{product.oldPrice}</span>
            )}
            {product.oldPrice && (
              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Save 11%</span>
            )}
          </div>

          <div className="flex items-center gap-4 sm:ml-auto">
            <button className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
              <ICONS.Phone className="w-5 h-5" /> Contact for Availability
            </button>
          </div>
        </div>
      </div>

      {/* Product Insights */}
      <section>
        <h2 className="text-2xl font-bold text-on-surface mb-6">Product Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-secondary">
              <ICONS.Science className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Composition</h3>
            </div>
            {[
              { label: 'Nitrogen (N)', val: '19%' },
              { label: 'Phosphorus (P)', val: '19%' },
              { label: 'Potassium (K)', val: '19%' }
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-surface-container-low last:border-0">
                <span className="text-on-surface text-sm opacity-60 font-semibold">{row.label}</span>
                <span className="text-on-surface font-black">{row.val}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <ICONS.Water className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Application</h3>
            </div>
            <p className="text-on-surface-variant font-medium text-sm">Suitable for foliar spray and fertigation. Best applied during active growth phase.</p>
            <div className="mt-auto bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <span className="block text-[10px] font-black uppercase tracking-widest text-primary mb-1">Recommended Dosage</span>
              <span className="text-2xl font-bold text-on-surface">3-5 gm / Litre</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 text-secondary">
              <ICONS.Sprout className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Best For Crops</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Tomatoes', 'Wheat', 'Sugarcane', 'Grapes'].map((crop, i) => (
                <span key={i} className="bg-surface-container px-4 py-2 rounded-full text-xs font-bold text-on-surface-variant border border-surface-container-highest">
                  {crop}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
