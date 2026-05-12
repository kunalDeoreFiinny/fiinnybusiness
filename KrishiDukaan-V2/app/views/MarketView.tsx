import { MarketplaceProduct } from "../../types/product";
import { ICONS, PRODUCTS } from '../constants';
import { motion } from 'framer-motion';

interface MarketViewProps {
  products?: MarketplaceProduct[];
  onProductClick: (id: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function MarketView({ 
  products = PRODUCTS, 
  onProductClick, 
  selectedCategory, 
  onCategoryChange 
}: MarketViewProps) {
  const categories = [
    { id: 'all', name: 'All Products', icon: null },
    { id: 'seeds', name: 'Seeds', icon: ICONS.Sprout },
    { id: 'fertilizers', name: 'Fertilizers', icon: ICONS.Science },
    { id: 'tools', name: 'Tools', icon: ICONS.Market }
  ];

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-3 tracking-tight">Local Marketplace</h1>
        <p className="text-on-surface-variant text-lg">Find premium agricultural supplies from trusted stores nearby.</p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 overflow-x-auto pb-2 hide-scrollbar">
        <div className="flex gap-3">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                selectedCategory === cat.id 
                  ? 'bg-primary text-white shadow-primary/20' 
                  : 'bg-white text-on-surface border border-surface-container-highest hover:bg-surface-container-low'
              }`}
            >
              {cat.icon && <cat.icon className="w-4 h-4 text-secondary" />}
              {cat.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-surface-container-highest px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-surface-container transition-colors">
            <ICONS.Efficiency className="w-4 h-4 rotate-90" /> Filter
          </button>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-2xl text-sm font-bold border border-transparent">
            <ICONS.Location className="w-4 h-4 text-secondary" />
            <span>Within 5km</span>
            <ICONS.ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? products.map((product, idx) => (
          <motion.article 
            key={`${product.id}-${idx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onProductClick(product.id)}
            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-ambient transition-all duration-300 flex flex-col border border-surface-container group cursor-pointer"
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-surface-container">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-3 left-3">
                <span className="bg-primary-container/90 backdrop-blur-md text-on-primary-container text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm">
                  In-Stock
                </span>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-1.5 text-secondary mb-2 bg-secondary/5 self-start px-2 py-0.5 rounded-lg">
                <ICONS.Market className="w-3 h-3" />
                <span className="text-[10px] font-bold tracking-tight">{product.store} • {product.distance}</span>
              </div>
              <h3 className="font-bold text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">{product.fullName || product.name}</h3>
              <p className="text-on-surface-variant text-xs mt-1 line-clamp-1">{product.description}</p>
              
              <div className="mt-auto pt-4 flex justify-between items-center border-t border-surface-container">
                <div className="flex flex-col">
                  <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Per unit</span>
                  <span className="text-lg font-bold text-secondary">₹{product.price}</span>
                </div>
              </div>
            </div>
          </motion.article>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-surface-container">
            <ICONS.Search className="w-10 h-10 text-outline-variant mx-auto mb-4" />
            <h3 className="text-xl font-bold text-on-surface mb-2">No products found</h3>
            <p className="text-on-surface-variant">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
