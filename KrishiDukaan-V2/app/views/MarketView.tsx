import { MarketplaceProduct } from "../../types/product";
import { ICONS, PRODUCTS } from '../constants';
import { motion } from 'framer-motion';
import { HelperIcon, HelperTooltip } from '../../components/helpers';
import { useEffect, useRef } from 'react';
import { trackProductImpression } from '../firebase';

interface MarketViewProps {
  products?: MarketplaceProduct[];
  onProductClick: (id: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  maxDistance: number;
  onMaxDistanceChange: (distance: number) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;
  sortBy: 'none' | 'price-low' | 'price-high';
  onSortByChange: (value: 'none' | 'price-low' | 'price-high') => void;
}

export default function MarketView({ 
  products = PRODUCTS, 
  onProductClick, 
  selectedCategory, 
  onCategoryChange,
  maxDistance,
  onMaxDistanceChange,
  showFilters,
  onToggleFilters,
  inStockOnly,
  onInStockOnlyChange,
  sortBy,
  onSortByChange
}: MarketViewProps) {
  const trackedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Track impressions for products currently in view
    products.forEach((p, index) => {
      if (!trackedIds.current.has(p.id)) {
        trackProductImpression(p.id, index + 1);
        trackedIds.current.add(p.id);
      }
    });
  }, [products]);

  const categories = [
    { id: 'all', name: 'All Products', icon: null },
    { id: 'seeds', name: 'Seeds', icon: ICONS.Sprout },
    { id: 'fertilizers', name: 'Fertilizers', icon: ICONS.Science },
    { id: 'tools', name: 'Tools', icon: ICONS.Market }
  ];

  const distances = [
    { label: 'Within 5km', value: 5 },
    { label: 'Within 10km', value: 10 },
    { label: 'Within 25km', value: 25 },
    { label: 'Within 50km', value: 50 },
    { label: 'All Distances', value: 1000 }
  ];

  const currentDistanceLabel = distances.find(d => d.value === maxDistance)?.label || `Within ${maxDistance}km`;

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
        
        <div className="flex items-center gap-3" data-tour="market-filters">
          <div className="relative flex items-center gap-1">
            <button 
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors ${
                showFilters 
                  ? 'bg-primary text-white' 
                  : (inStockOnly || sortBy !== 'none')
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-white border border-surface-container-highest hover:bg-surface-container'
              }`}
            >
              <ICONS.Efficiency className="w-4 h-4 rotate-90" /> Filter
              {(inStockOnly || sortBy !== 'none') && <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>}
            </button>
            <HelperIcon
              size="xs"
              variant="ghost"
              side="bottom"
              title="Filters"
              ariaLabel="Filter help"
              content="Narrow products by category, availability, or nearby stores."
            />
            
            {showFilters && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-surface-container-highest rounded-2xl shadow-ambient p-5 w-72">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-base">Filter & Sort</h4>
                  <button 
                    onClick={() => {
                      onInStockOnlyChange(false);
                      onSortByChange('none');
                    }}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-outline mb-3">Availability</h5>
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-2 rounded-xl transition-colors group">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${inStockOnly ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                        {inStockOnly && <ICONS.Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={inStockOnly}
                        onChange={(e) => onInStockOnlyChange(e.target.checked)}
                      />
                      <span className="text-sm font-bold text-on-surface">In Stock Only</span>
                    </label>
                  </div>

                  <div>
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-outline mb-3">Sort by Price</h5>
                    <div className="flex flex-col gap-1">
                      {[
                        { id: 'none', label: 'Recommended' },
                        { id: 'price-low', label: 'Price: Low to High' },
                        { id: 'price-high', label: 'Price: High to Low' }
                      ].map((option) => (
                        <label key={option.id} className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-2 rounded-xl transition-colors group">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${sortBy === option.id ? 'border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                            {sortBy === option.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                          </div>
                          <input 
                            type="radio" 
                            name="sortBy"
                            className="hidden" 
                            checked={sortBy === option.id}
                            onChange={() => onSortByChange(option.id as any)}
                          />
                          <span className={`text-sm font-bold ${sortBy === option.id ? 'text-primary' : 'text-on-surface'}`}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onToggleFilters}
                  className="w-full mt-6 bg-primary text-white py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  Show Results
                </button>
              </div>
            )}
          </div>

          <div className="relative flex items-center gap-1">
            <select 
              value={maxDistance}
              onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
              className="appearance-none bg-surface-container-low pl-10 pr-10 py-2.5 rounded-2xl text-sm font-bold border border-transparent focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-surface-container transition-colors"
            >
              {distances.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <div className="absolute right-8 pointer-events-none">
              <ICONS.ChevronRight className="w-4 h-4 rotate-90 text-on-surface-variant" />
            </div>
            <div className="absolute left-4 pointer-events-none">
              <ICONS.Location className="w-4 h-4 text-secondary" />
            </div>
            
            <HelperIcon
              size="xs"
              variant="ghost"
              side="bottom"
              title="Distance"
              ariaLabel="Distance help"
              content="Increase distance to discover more stores and products."
            />
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
              <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
                <HelperTooltip
                  side="bottom"
                  title="Stock"
                  content="“Low Stock” means limited quantity available nearby."
                >
                  <span className="bg-primary-container/90 backdrop-blur-md text-on-primary-container text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm cursor-help">
                    In-Stock
                  </span>
                </HelperTooltip>
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
