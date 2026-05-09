import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Microscope, Store as StoreIcon, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { listProductsForLocation } from '../services/productService';
import { useLocation } from '../LocationContext';
import type { ProductListItem } from '../services/productService';

const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: null },
  { id: 'seeds', name: 'Seeds', icon: Sprout },
  { id: 'fertilizers', name: 'Fertilizers', icon: Microscope },
  { id: 'tools', name: 'Tools', icon: StoreIcon },
];

export function MarketPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listProductsForLocation(location.lat, location.lng)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [location.lat, location.lng]);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(({ product }) => product.category === activeCategory);

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-3 tracking-tight">Local Marketplace</h1>
        <p className="text-on-surface-variant text-lg">Find premium agricultural supplies from trusted stores near {location.label}.</p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                activeCategory === cat.id ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-on-surface border border-surface-container-highest hover:bg-surface-container-low'
              }`}>
              {cat.icon && <cat.icon className="w-4 h-4" />}
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-2xl text-sm font-bold border border-transparent">
          <MapPin className="w-4 h-4 text-secondary" />
          <span className="text-on-surface-variant">{location.label}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-surface-container animate-pulse">
              <div className="aspect-[4/3] bg-surface-container" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-surface-container rounded w-1/2" />
                <div className="h-4 bg-surface-container-high rounded" />
                <div className="h-3 bg-surface-container rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(({ product, inStockRetailerCount, minPrice }, idx) => (
            <motion.article key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }} onClick={() => navigate(`/product/${product.id}`)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-ambient transition-all duration-300 flex flex-col border border-surface-container group cursor-pointer">
              <div className="aspect-[4/3] relative overflow-hidden flex items-center justify-center bg-surface-container">
                <span style={{ fontSize: 56 }}>{product.emoji}</span>
                {inStockRetailerCount > 0 && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary-container/90 backdrop-blur-md text-on-primary-container text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm">In-Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-secondary mb-2 bg-secondary/5 self-start px-2 py-0.5 rounded-lg">
                  <StoreIcon className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{inStockRetailerCount} shops</span>
                </div>
                <h3 className="font-bold text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.shortName}</h3>
                <p className="text-on-surface-variant text-xs mt-1 line-clamp-1">{product.description}</p>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-surface-container">
                  <div>
                    <span className="text-[10px] text-outline font-bold uppercase tracking-widest">From</span>
                    <div className="text-lg font-bold text-secondary">{minPrice > 0 ? `₹${minPrice}` : '—'}</div>
                  </div>
                  <button className="bg-primary text-white p-2 rounded-full shadow-sm hover:bg-primary-container transition-all active:scale-90">
                    <span className="text-sm font-bold px-1">+</span>
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
