import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, List, Map, Heart } from 'lucide-react';
import { BRANDS, type StockResult } from '../demoData';
import type { Retailer } from '../demoData';
import { useLocation } from '../LocationContext';
import { RetailerMap } from '../components/RetailerMap';
import { RetailerCard } from '../components/RetailerCard';
import { useRetailersForProduct } from '../hooks/useRetailersForProduct';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShopRowSkeleton } from '../components/SkeletonLoader';
import { relativeTime } from '../hooks/useFormatTime';
import { formatDistance } from '../utils/distance';

type ViewMode = 'map' | 'list';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location, requestGps, requesting } = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const { requireLogin } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const { data, loading } = useRetailersForProduct(id, location.lat, location.lng);
  const product = data?.product ?? null;
  const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;
  const results = data?.results ?? [];
  const inStock = results.filter((r) => r.stock.inStock);
  const outOfStock = results.filter((r) => !r.stock.inStock);

  function handleAddToCart(retailerId: string) {
    if (!product) return;
    requireLogin(() => {
      addToCart(product.id, retailerId, 1);
      navigate('/cart');
    }, 'add-to-cart');
  }

  function handleBuyNow(retailerId: string) {
    if (!product) return;
    requireLogin(() => {
      addToCart(product.id, retailerId, 1);
      navigate('/cart');
    }, 'buy-now');
  }

  function handleWishlist() {
    if (!product) return;
    requireLogin(() => { toggleWishlist(product.id); }, 'wishlist');
  }

  if (loading && !data) {
    return (
      <div style={{ padding: 16 }}>
        <ShopRowSkeleton />
        <div style={{ height: 10 }} />
        <ShopRowSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontSize: 14 }}>Product not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 12, padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Back to home
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.shortName}
        </span>
        <button
          onClick={handleWishlist}
          aria-label="Save to wishlist"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: wishlisted ? '#dc2626' : '#9ca3af' }}
        >
          <Heart size={18} fill={wishlisted ? '#dc2626' : 'none'} />
        </button>
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2, gap: 2 }}>
          <button
            onClick={() => setViewMode('map')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: viewMode === 'map' ? '#fff' : 'transparent', color: viewMode === 'map' ? '#111827' : '#6b7280', boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <Map size={13} /> Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? '#111827' : '#6b7280', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <List size={13} /> List
          </button>
        </div>
      </div>

      <section style={{ padding: 16, background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${product.imageColor}20, ${product.imageColor}40)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
          }}>
            {product.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: brand?.color ?? '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
              {brand?.name ?? 'KaranArjun PowerPlus'} · {product.categoryLabel}
            </div>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: '#111827', lineHeight: 1.3, marginBottom: 6 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{product.description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {product.benefits.map((b) => (
            <span key={b} style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '3px 8px', fontWeight: 500 }}>
              ✓ {b}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Available in:</span>
          {product.packSizes.map((s) => (
            <span key={s} style={{ fontSize: 11, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px' }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Location + scope bar */}
      <div style={{ padding: '10px 16px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <MapPin size={13} style={{ color: '#15803d' }} />
          <span style={{ fontSize: 12, color: '#15803d', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Near <strong>{location.label}</strong> · {inStock.length} in stock
            {data?.scope === 'radius' && data.radiusKm > 0 && ` · within ${data.radiusKm} km`}
            {data?.scope === 'district' && ` · district-wide`}
            {data?.scope === 'state' && ` · state-wide`}
          </span>
        </div>
        {location.source !== 'gps' && (
          <button onClick={requestGps} disabled={requesting} style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            {requesting ? 'Getting…' : 'Use my GPS'}
          </button>
        )}
        {data?.fromCache && data.cachedAt && (
          <span style={{ fontSize: 10, color: '#92400e' }}>· Last updated {relativeTime(data.cachedAt)}</span>
        )}
      </div>

      {/* Map view */}
      {viewMode === 'map' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 340, position: 'relative', background: '#e5e7eb' }}>
            <RetailerMap
              results={results}
              userLat={location.lat}
              userLng={location.lng}
              onSelect={setSelectedRetailer}
              selected={selectedRetailer}
            />
          </div>

          {selectedRetailer ? (
            <RetailerCard
              result={results.find((r) => r.retailer.id === selectedRetailer.id)!}
              onClose={() => setSelectedRetailer(null)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          ) : (
            <div style={{ padding: '14px 16px', background: '#fff' }}>
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
                {results.length > 0
                  ? `Tap a pin to see retailer details · ${inStock.length} stocking this product`
                  : 'No retailers found in your area'}
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ padding: '0 16px 16px', background: '#fff', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 10, paddingTop: 14 }}>ALL RETAILERS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.map((r) => (
                  <RetailerRow
                    key={r.retailer.id}
                    result={r}
                    onSelect={() => setSelectedRetailer(r.retailer)}
                    isSelected={selectedRetailer?.id === r.retailer.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div style={{ padding: '16px' }}>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No retailers found</p>
              <p style={{ fontSize: 13 }}>Try enabling GPS for more accurate results</p>
            </div>
          ) : (
            <>
              {inStock.length > 0 && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 10 }}>IN STOCK ({inStock.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {inStock.map((r) => <RetailerCard key={r.retailer.id} result={r} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />)}
                  </div>
                </>
              )}
              {outOfStock.length > 0 && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 10 }}>OUT OF STOCK ({outOfStock.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.6 }}>
                    {outOfStock.map((r) => <RetailerCard key={r.retailer.id} result={r} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RetailerRow({ result, onSelect, isSelected }: { result: StockResult; onSelect: () => void; isSelected: boolean }) {
  const { retailer, stock, distanceM: d } = result;
  return (
    <button
      onClick={onSelect}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: isSelected ? '#f0fdf4' : '#f9fafb', border: `1px solid ${isSelected ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ fontSize: 18 }}>🏪</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{retailer.businessName}</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{retailer.city} · {formatDistance(d)}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {stock.inStock
          ? <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '2px 7px' }}>₹{stock.price}</span>
          : <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Out of stock</span>}
      </div>
    </button>
  );
}
