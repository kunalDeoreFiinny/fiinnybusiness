import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Map as MapIcon, List as ListIcon, MapPin, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  PRODUCTS, CATEGORIES, RETAILERS, RETAILER_STOCK,
  searchProducts, type StockResult,
} from '../demoData';
import { useUserLocation } from '../hooks/useUserLocation';
import { getDistanceKm } from '../utils/distance';
import { ProductSearch } from '../components/ProductSearch';
import { RetailerCard, type RetailerCardData } from '../components/RetailerCard';
import { RetailerMap } from '../components/RetailerMap';
import { categoryIcon } from '../components/icons';
import { motion, AnimatePresence } from 'motion/react';

type ViewMode = 'list' | 'map';

const SUGGESTED_QUERIES = ['PowerPlus Gold', 'Shield', 'Boost', 'RootMax', 'Fungicide', 'Organic'];

export function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { coords, label, source } = useUserLocation();
  const [view, setView] = useState<ViewMode>('list');

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';

  const matchingProducts = useMemo(() => searchProducts(q, category), [q, category]);

  const retailerResults = useMemo<RetailerCardData[]>(() => {
    if (matchingProducts.length === 0) return [];
    const rows: RetailerCardData[] = [];
    matchingProducts.forEach((product) => {
      RETAILER_STOCK.forEach((stock) => {
        if (stock.productId !== product.id) return;
        if (!stock.inStock) return;
        const retailer = RETAILERS.find((r) => r.id === stock.retailerId);
        if (!retailer) return;
        rows.push({
          retailer,
          product,
          stock,
          distanceKm: getDistanceKm(coords, { lat: retailer.lat, lng: retailer.lng }),
        });
      });
    });
    rows.sort((a, b) => a.distanceKm - b.distanceKm);
    return rows;
  }, [matchingProducts, coords]);

  const mapResults: StockResult[] = useMemo(() => retailerResults.map((r) => ({
    retailer: r.retailer,
    stock: r.stock,
    distanceM: r.distanceKm * 1000,
  })), [retailerResults]);

  function setQuery(next: string) {
    const p = new URLSearchParams(params);
    if (next) p.set('q', next); else p.delete('q');
    setParams(p, { replace: true });
  }

  function setCategory(c: string) {
    const next = new URLSearchParams(params);
    if (c) next.set('category', c); else next.delete('category');
    setParams(next, { replace: true });
  }

  const isProductMode = !q && !category;

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col min-h-screen">
      {/* Search header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-container px-4 py-4 space-y-4">
        <ProductSearch
          query={q}
          onChange={setQuery}
          onClear={() => setQuery('')}
          suggestions={isProductMode ? SUGGESTED_QUERIES : []}
        />

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
              !category 
                ? 'bg-primary text-white shadow-primary/20' 
                : 'bg-white text-on-surface border border-surface-container-highest hover:bg-surface-container-low'
            }`}
          >
            {t('common.all')}
          </button>
          {CATEGORIES.map((c) => {
            const Icon = categoryIcon(c.id);
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  active 
                    ? 'bg-primary text-white shadow-primary/20' 
                    : 'bg-white text-on-surface border border-surface-container-highest hover:bg-surface-container-low'
                }`}
              >
                <Icon size={14} strokeWidth={2.5} /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results area */}
      <div className="flex-1 p-4 md:px-10 py-6">
        {/* Results status line */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-tight">
              {q || category
                ? t('search.statusRetailers', {
                    count: retailerResults.length,
                    label: q ? `"${q}"` : (CATEGORIES.find((c) => c.id === category)?.label ?? ''),
                  })
                : t('search.statusEmpty')}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant mt-1">
              <MapPin size={12} className="text-secondary" />
              <span>{t('search.distancesFrom')}</span>
              <span className="text-on-surface font-bold">{label}</span>
              {source === 'default' && <span className="opacity-60">· {t('common.approx')}</span>}
            </div>
          </div>

          {retailerResults.length > 0 && (
            <div className="bg-surface-container-low p-1 rounded-xl flex gap-1 shadow-inner border border-surface-container">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                  view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-outline hover:text-on-surface'
                }`}
              >
                <ListIcon size={14} /> {t('product.list')}
              </button>
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                  view === 'map' ? 'bg-white text-primary shadow-sm' : 'text-outline hover:text-on-surface'
                }`}
              >
                <MapIcon size={14} /> {t('product.map')}
              </button>
            </div>
          )}
        </div>

        {/* Dynamic content */}
        <AnimatePresence mode="wait">
          {isProductMode ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProductBrowseGrid onPick={(name) => setQuery(name)} />
            </motion.div>
          ) : retailerResults.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center mb-6">
                <Search size={32} className="text-outline" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">{t('search.noStockTitle')}</h3>
              <p className="text-on-surface-variant max-w-xs">{t('search.noStockBody')}</p>
            </motion.div>
          ) : view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {retailerResults.map((data, i) => (
                <RetailerCard
                  key={`${data.retailer.id}-${data.product.id}`}
                  data={data}
                  rank={i + 1}
                  onClick={() => navigate(`/retailer/${data.retailer.id}`)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[calc(100vh-320px)] min-h-[400px] rounded-3xl overflow-hidden border border-surface-container shadow-ambient"
            >
              <RetailerMap
                results={mapResults}
                userLat={coords.lat}
                userLng={coords.lng}
                onSelect={(r) => navigate(`/retailer/${r.id}`)}
                selected={null}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProductBrowseGrid({ onPick }: { onPick: (name: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-widest text-outline">
          {t('search.popularProducts')}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p.shortName)}
            className="group bg-white border border-surface-container rounded-3xl p-4 text-left hover:shadow-ambient hover:border-primary transition-all flex flex-col gap-3"
          >
            <div className="aspect-square rounded-2xl bg-surface-container overflow-hidden">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
            </div>
            <div>
              <div className="text-[9px] font-black text-outline uppercase tracking-widest mb-1">
                {p.categoryLabel}
              </div>
              <div className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                {p.shortName}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-primary font-black uppercase tracking-widest mt-2">
                <span>Find Stores</span>
                <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
