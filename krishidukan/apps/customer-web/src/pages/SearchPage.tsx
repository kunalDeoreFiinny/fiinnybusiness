import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Map as MapIcon, List as ListIcon, MapPin } from 'lucide-react';
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

  // Build a flat retailer-results list for every matching product, in-stock only,
  // sorted nearest-first. The brief says ignore out-of-stock; we filter them here.
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

  // Map view needs StockResult-shaped data.
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
    <div>
      {/* Search header */}
      <div style={{ background: '#fff', padding: 14, borderBottom: '1px solid #eef0f3', position: 'sticky', top: 68, zIndex: 30 }}>
        <ProductSearch
          query={q}
          onChange={setQuery}
          onClear={() => setQuery('')}
          suggestions={isProductMode ? SUGGESTED_QUERIES : []}
        />

        {/* Category chips */}
        <div className="kd-hide-scrollbar" style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', paddingBottom: 2 }}>
          <button
            onClick={() => setCategory('')}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: !category ? '#16a34a' : '#e5e7eb', background: !category ? '#f0fdf4' : '#fff', color: !category ? '#15803d' : '#6b7280' }}
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
                style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: active ? '#16a34a' : '#e5e7eb', background: active ? '#f0fdf4' : '#fff', color: active ? '#15803d' : '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <Icon size={13} strokeWidth={2.1} /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: '14px 16px 28px' }}>
        {/* Status line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, color: '#111827', fontWeight: 700 }}>
              {q || category
                ? t('search.statusRetailers', {
                    count: retailerResults.length,
                    label: q ? `"${q}"` : (CATEGORIES.find((c) => c.id === category)?.label ?? ''),
                  })
                : t('search.statusEmpty')}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color="#6b7280" />
              {t('search.distancesFrom')} <strong style={{ color: '#374151' }}>{label}</strong>
              {source === 'default' && <span> · {t('common.approx')}</span>}
            </div>
          </div>

          {retailerResults.length > 0 && (
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2, gap: 2 }}>
              <button
                onClick={() => setView('list')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: view === 'list' ? '#fff' : 'transparent', color: view === 'list' ? '#111827' : '#6b7280', boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                <ListIcon size={13} /> {t('product.list')}
              </button>
              <button
                onClick={() => setView('map')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: view === 'map' ? '#fff' : 'transparent', color: view === 'map' ? '#111827' : '#6b7280', boxShadow: view === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                <MapIcon size={13} /> {t('product.map')}
              </button>
            </div>
          )}
        </div>

        {/* Empty / browse mode */}
        {isProductMode ? (
          <ProductBrowseGrid onPick={(name) => setQuery(name)} />
        ) : retailerResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Search size={28} color="#6b7280" strokeWidth={1.8} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('search.noStockTitle')}</p>
            <p style={{ fontSize: 13 }}>{t('search.noStockBody')}</p>
          </div>
        ) : view === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
            {retailerResults.map((data, i) => (
              <RetailerCard
                key={`${data.retailer.id}-${data.product.id}`}
                data={data}
                rank={i + 1}
                onClick={() => navigate(`/retailer/${data.retailer.id}`)}
              />
            ))}
          </div>
        ) : (
          <div style={{ height: 'calc(100vh - 220px)', minHeight: 360, position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#e5e7eb' }}>
            <RetailerMap
              results={mapResults}
              userLat={coords.lat}
              userLng={coords.lng}
              onSelect={(r) => navigate(`/retailer/${r.id}`)}
              selected={null}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Browse grid shown when no query/category is set yet — links the input to the rest of the catalog.
function ProductBrowseGrid({ onPick }: { onPick: (name: string) => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        {t('search.popularProducts')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p.shortName)}
            style={{
              background: '#fff', border: '1px solid #eef0f3', borderRadius: 14,
              padding: 14, cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 4,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {p.categoryLabel}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
              {p.shortName}
            </div>
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
              {t('search.findRetailers')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
