import { ICONS, PRODUCTS, STORES } from '../constants';
import { motion } from 'motion/react';
import { useState } from 'react';

interface ProductDetailViewProps {
  productId: string | null;
  onBack: () => void;
  onStoreClick: (storeId: string) => void;
}

export default function ProductDetailView({ productId, onBack, onStoreClick }: ProductDetailViewProps) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const [quantity, setQuantity] = useState(1);

  // Find stores which have this product
  const availableStores = STORES.filter(store => 
    product.availability?.some(a => a.storeId === store.id)
  );

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagery */}
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
            <div className="w-24 h-24 rounded-2xl border border-surface-container-highest bg-surface-container flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors">
              <ICONS.Search className="w-8 h-8 text-outline" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-2">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-secondary/20">Organic Certified</span>
              <div className="flex items-center gap-1 text-secondary">
                <ICONS.Star className="w-4 h-4 fill-secondary" />
                <span className="text-sm font-black">4.8 (124 Reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight leading-tight">{product.fullName || product.name}</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Balanced nutrition for all stages of crop growth. Ensures robust vegetative development, better root systems, and higher yields. 100% water-soluble for immediate absorption.
            </p>
          </div>

          <div className="flex items-end gap-3 pb-6 border-b border-surface-container">
            <span className="text-4xl font-extrabold text-secondary tracking-tight">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-xl text-on-surface-variant line-through mb-1">₹{product.oldPrice}</span>
            )}
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ml-auto">Save 11%</span>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-on-surface uppercase tracking-widest text-xs">Available at these Stores</h3>
            <div className="grid grid-cols-1 gap-3">
              {availableStores.length > 0 ? (
                availableStores.map(store => {
                  const availability = product.availability?.find(a => a.storeId === store.id);
                  return (
                    <div 
                      key={store.id}
                      className="flex items-center gap-4 p-4 rounded-3xl border-2 border-surface-container bg-white text-left group hover:border-primary transition-all relative overflow-hidden"
                    >
                      <div className="p-3 rounded-2xl bg-surface-container group-hover:bg-primary-container group-hover:text-white transition-colors">
                        <ICONS.Market className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center pr-2">
                          <span className="block font-bold text-on-surface uppercase tracking-tight">{store.name}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            availability?.stockLevel === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {availability?.stockLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant flex items-center gap-1">
                            <ICONS.Location className="w-3 h-3" /> {store.distance}
                          </span>
                          <button 
                            onClick={() => onStoreClick(store.id)}
                            className="text-[10px] uppercase font-black tracking-widest text-primary hover:underline flex items-center gap-1"
                          >
                            <ICONS.Directions className="w-3 h-3" /> View on Map
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-3xl border-2 border-dashed border-surface-container text-center text-on-surface-variant font-medium text-sm">
                  This product is currently only available for home delivery.
                </div>
              )}
              
              <button className="flex items-center gap-4 p-4 rounded-3xl border-2 border-surface-container hover:border-primary transition-all bg-white text-left group">
                <div className="p-3 rounded-2xl bg-surface-container group-hover:bg-primary-container group-hover:text-white transition-colors">
                  <ICONS.Delivery className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-on-surface">Deliver to Farm</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant">Arrival Tomorrow, 10 AM</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border-2 border-surface-container rounded-2xl h-14 overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <ICONS.Minus className="w-5 h-5 text-on-surface" />
              </button>
              <input 
                type="text" 
                value={quantity} 
                readOnly
                className="w-12 h-full text-center font-black text-on-surface focus:ring-0 border-none bg-transparent"
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-full flex items-center justify-center hover:bg-surface-container transition-colors"
              >
                <ICONS.Plus className="w-5 h-5 text-on-surface" />
              </button>
            </div>
            <button className="flex-1 h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              <ICONS.AddToCart className="w-5 h-5" /> Add to Order
            </button>
          </div>
        </div>
      </div>

      {/* Insights */}
      <section className="py-10">
        <h2 className="text-3xl font-bold text-on-surface mb-8">Product Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container flex flex-col gap-6">
            <div className="flex items-center gap-3 text-secondary">
              <ICONS.Science className="w-6 h-6" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Composition</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nitrogen (N)', val: '19%' },
                { label: 'Phosphorus (P)', val: '19%' },
                { label: 'Potassium (K)', val: '19%' }
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-surface-container-low last:border-0">
                  <span className="text-on-surface font-semibold text-sm opacity-60">{row.label}</span>
                  <span className="text-on-surface font-black">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container flex flex-col gap-6">
            <div className="flex items-center gap-3 text-primary">
              <ICONS.Water className="w-6 h-6" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Application</h3>
            </div>
            <p className="text-on-surface-variant font-medium">Suitable for foliar spray and fertigation. Best applied during active growth phase.</p>
            <div className="mt-auto bg-primary/5 rounded-2xl p-4 border border-primary/10">
              <span className="block text-[10px] font-black uppercase tracking-widest text-primary mb-1">Recommended Dosage</span>
              <span className="text-2xl font-bold text-on-surface">3-5 gm / Litre</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container flex flex-col gap-6">
            <div className="flex items-center gap-3 text-secondary">
              <ICONS.Sprout className="w-6 h-6" />
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
