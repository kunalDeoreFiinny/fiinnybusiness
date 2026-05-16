"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { MarketplaceProduct } from "../../types/product";
import { ICONS, PRODUCTS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { HelperTooltip } from '../../components/helpers';
import { trackProductImpression } from '../firebase';
import type { StoreWithDistance } from '../utils/nearby';

interface MarketViewProps {
  products?: MarketplaceProduct[];
  onProductClick: (id: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  storesWithDistance?: StoreWithDistance[];
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

const DISTANCE_OPTIONS = [
  { label: 'Any distance', km: Infinity },
  { label: 'Within 5 km', km: 5 },
  { label: 'Within 25 km', km: 25 },
  { label: 'Within 100 km', km: 100 },
  { label: 'Within 500 km', km: 500 },
];

function inferBrand(name: string): string {
  // First word of product name is a reasonable brand proxy for this catalog.
  return name.trim().split(/\s+/)[0] || 'Other';
}

function formatDistance(km: number): string {
  if (!Number.isFinite(km)) return 'Nearby';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export default function MarketView({
  products = PRODUCTS,
  onProductClick,
  selectedCategory,
  onCategoryChange,
  storesWithDistance = [],
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
    { id: 'pesticides', name: 'Pesticides', icon: ICONS.Science },
    { id: 'tools', name: 'Tools', icon: ICONS.Market },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const [distanceOpen, setDistanceOpen] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(Infinity);
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(3000);

  const storeDistanceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of storesWithDistance) m.set(s.id, s.distanceKm);
    return m;
  }, [storesWithDistance]);

  const productDistance = (p: MarketplaceProduct): number => {
    const candidates: number[] = [];
    for (const a of p.availability || []) {
      const d = storeDistanceMap.get(a.storeId);
      if (typeof d === 'number' && Number.isFinite(d)) candidates.push(d);
    }
    if (!candidates.length) return Infinity;
    return Math.min(...candidates);
  };

  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) set.add(inferBrand(p.name));
    return ['all', ...Array.from(set).sort()];
  }, [products]);

  const visibleProducts = useMemo(() => {
    let list = products.slice();

    if (brandFilter !== 'all') {
      list = list.filter((p) => inferBrand(p.name) === brandFilter);
    }
    if (Number.isFinite(priceMax)) {
      list = list.filter((p) => p.price <= priceMax);
    }
    if (Number.isFinite(maxDistanceKm)) {
      list = list.filter((p) => productDistance(p) <= maxDistanceKm);
    }
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => productDistance(a) - productDistance(b));
    }
    return list;
  }, [products, brandFilter, priceMax, maxDistanceKm, sortBy, storeDistanceMap]);

  const distanceLabel =
    DISTANCE_OPTIONS.find((o) => o.km === maxDistanceKm)?.label || 'Within 5 km';

  const activeFilterCount =
    (brandFilter !== 'all' ? 1 : 0) +
    (priceMax < 3000 ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0);

  return (
    <div className="px-4 md:px-10 max-w-7xl mx-auto w-full py-8">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-3 tracking-tight">
          Local Marketplace
        </h1>
        <p className="text-on-surface-variant text-lg">
          Find premium agricultural supplies from trusted stores nearby.
        </p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pb-2">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
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
        <div className="flex items-center gap-3 relative" data-tour="market-filters">
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setFilterOpen((v) => !v);
                setDistanceOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors border ${
                filterOpen || activeFilterCount > 0
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-on-surface border-surface-container-highest hover:bg-surface-container'
              }`}
            >
              <ICONS.Efficiency className="w-4 h-4 rotate-90" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-white text-primary text-[10px] font-black rounded-full px-1.5 py-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-2xl shadow-2xl border border-surface-container p-4 z-50"
                >
                  <div className="mb-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-outline">
                      Sort by
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortKey)}
                      className="mt-1 w-full border border-surface-container-highest rounded-xl px-3 py-2 text-sm font-medium bg-surface-container-low"
                    >
                      <option value="default">Nearest first</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A → Z</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-outline">
                      Brand
                    </label>
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      className="mt-1 w-full border border-surface-container-highest rounded-xl px-3 py-2 text-sm font-medium bg-surface-container-low"
                    >
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>
                          {b === 'all' ? 'All brands' : b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-outline">
                      Max price: ₹{priceMax.toLocaleString('en-IN')}
                    </label>
                    <input
                      type="range"
                      min={100}
                      max={3000}
                      step={50}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full mt-1 accent-primary"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setBrandFilter('all');
                      setPriceMax(3000);
                      setSortBy('default');
                    }}
                    className="text-xs font-bold text-primary hover:underline mt-2"
                  >
                    Reset filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Distance */}
          <div className="relative">
            <button
              onClick={() => {
                setDistanceOpen((v) => !v);
                setFilterOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm transition-colors border ${
                Number.isFinite(maxDistanceKm)
                  ? 'bg-secondary-container/30 text-on-surface border-secondary-container'
                  : 'bg-white text-on-surface border-surface-container-highest'
              }`}
            >
              <ICONS.Location className="w-4 h-4 text-secondary" />
              {distanceLabel}
              <ICONS.ChevronRight className="w-4 h-4 rotate-90" />
            </button>
            <AnimatePresence>
              {distanceOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-2xl shadow-2xl border border-surface-container py-2 z-50"
                >
                  {DISTANCE_OPTIONS.map((o) => (
                    <button
                      key={o.label}
                      onClick={() => {
                        setMaxDistanceKm(o.km);
                        setDistanceOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-container-low ${
                        maxDistanceKm === o.km ? 'text-primary font-bold' : 'text-on-surface'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="text-sm text-outline mb-4 font-medium">
        Showing <span className="text-on-surface font-bold">{visibleProducts.length}</span> products
        {brandFilter !== 'all' ? ` from ${brandFilter}` : ''}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product, idx) => {
            const dist = productDistance(product);
            const brand = inferBrand(product.name);
            // Try to derive size by stripping the brand-like prefix from fullName.
            const size =
              product.fullName && product.fullName !== product.name
                ? product.fullName.replace(product.name, '').trim() || null
                : null;
            return (
              <motion.article
                key={`${product.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.03, 0.6) }}
                onClick={() => onProductClick(product.id)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-ambient transition-all duration-300 flex flex-col border border-surface-container group cursor-pointer"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-surface-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 bg-white"
                  />
                  <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
                    <HelperTooltip
                      side="bottom"
                      textKey="stockBadge"
                    >
                      <span className="bg-primary-container/90 backdrop-blur-md text-on-primary-container text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm cursor-help">
                        In-Stock
                      </span>
                    </HelperTooltip>
                  </div>
                  {product.category && product.category !== 'general' && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-on-surface text-[10px] uppercase font-black px-2 py-0.5 rounded-full shadow-sm capitalize">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-secondary mb-2 bg-secondary/5 self-start px-2 py-0.5 rounded-lg">
                    <ICONS.Market className="w-3 h-3" />
                    <span className="text-[10px] font-bold tracking-tight">
                      {product.store} • {formatDistance(dist)}
                    </span>
                  </div>
                  <h3 className="font-bold text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-on-surface-variant text-xs mt-1 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mt-auto pt-3 flex justify-between items-end border-t border-surface-container">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-outline font-bold uppercase tracking-widest">
                        {size || 'Per unit'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-secondary">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-[10px] text-outline line-through">
                            ₹{product.oldPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-outline font-semibold">{brand}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                    className="mt-2 w-full border-2 border-primary text-primary text-xs font-bold py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </motion.article>
            );
          })
        ) : (
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
