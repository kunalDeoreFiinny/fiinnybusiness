import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Star, List, Map, MessageCircle, ShoppingCart, Heart, Zap, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BRANDS, type StockResult } from '../demoData';
import type { Retailer } from '../demoData';
import { useLocation } from '../LocationContext';
import { RetailerMap } from '../components/RetailerMap';
import { useRetailersForProduct } from '../hooks/useRetailersForProduct';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShopRowSkeleton } from '../components/SkeletonLoader';
import { relativeTime } from '../hooks/useFormatTime';
import { formatDistance } from '../utils/distance';
import { productIcon, ShopIcon } from '../components/icons';

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
  const { t } = useTranslation();
  const product = data?.product ?? null;
  const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;
  const results = data?.results ?? [];
  const inStock = results.filter((r) => r.stock.inStock);
  const outOfStock = results.filter((r) => !r.stock.inStock);

  // TEMP_DISABLED: Cart feature disabled temporarily
  function handleAddToCart(_retailerId: string) {}
  function handleBuyNow(_retailerId: string) {}

  // TEMP_DISABLED: Login/auth disabled — wishlist works without gate
  function handleWishlist() {
    if (!product) return;
    toggleWishlist(product.id);
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
        <p style={{ color: '#dc2626', fontSize: 14 }}>{t('product.notFound')}</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 12, padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {t('product.backHome')}
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
          aria-label={t('product.saveWishlistAria')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: wishlisted ? '#dc2626' : '#9ca3af' }}
        >
          <Heart size={18} fill={wishlisted ? '#dc2626' : 'none'} />
        </button>
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2, gap: 2 }}>
          <button
            onClick={() => setViewMode('map')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: viewMode === 'map' ? '#fff' : 'transparent', color: viewMode === 'map' ? '#111827' : '#6b7280', boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <Map size={13} /> {t('product.map')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? '#111827' : '#6b7280', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            <List size={13} /> {t('product.list')}
          </button>
        </div>
      </div>

      <section style={{ padding: 16, background: '#fff', borderBottom: '1px solid #eef0f3' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{
            width: 76, height: 76, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${product.imageColor}15, ${product.imageColor}30)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {(() => { const Icon = productIcon(product.id); return <Icon size={40} color={product.imageColor} strokeWidth={1.7} />; })()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: brand?.color ?? '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {brand?.name ?? 'KaranArjun PowerPlus'} · {product.categoryLabel}
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', lineHeight: 1.3, marginBottom: 6, letterSpacing: '-0.01em' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55 }}>{product.description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          {product.benefits.map((b) => (
            <span key={b} style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '4px 10px 4px 8px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={11} strokeWidth={2.6} /> {b}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{t('product.availableIn')}</span>
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
            {t('product.locationNear', { label: location.label, count: inStock.length })}
            {data?.scope === 'radius' && data.radiusKm > 0 && ` · ${t('product.scopeWithin', { km: data.radiusKm })}`}
            {data?.scope === 'district' && ` · ${t('product.scopeDistrict')}`}
            {data?.scope === 'state' && ` · ${t('product.scopeState')}`}
          </span>
        </div>
        {location.source !== 'gps' && (
          <button onClick={requestGps} disabled={requesting} style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            {requesting ? t('product.gettingShort') : t('product.useMyGps')}
          </button>
        )}
        {data?.fromCache && data.cachedAt && (
          <span style={{ fontSize: 10, color: '#92400e' }}>· {t('home.lastUpdated', { when: relativeTime(data.cachedAt) })}</span>
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
                  ? t('product.tapPin', { count: inStock.length })
                  : t('product.noRetailers')}
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ padding: '0 16px 16px', background: '#fff', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginBottom: 10, paddingTop: 14 }}>{t('product.sectionAllRetailers')}</p>
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
              <div style={{ width: 64, height: 64, borderRadius: 18, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <MapPin size={30} color="#6b7280" strokeWidth={1.8} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('product.listEmptyTitle')}</p>
              <p style={{ fontSize: 13 }}>{t('product.listEmptyBody')}</p>
            </div>
          ) : (
            <>
              {inStock.length > 0 && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 10 }}>{t('product.sectionInStock', { count: inStock.length })}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {inStock.map((r) => <RetailerCard key={r.retailer.id} result={r} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />)}
                  </div>
                </>
              )}
              {outOfStock.length > 0 && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 10 }}>{t('product.sectionOutOfStock', { count: outOfStock.length })}</p>
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

interface RetailerCardProps {
  result: StockResult;
  onClose?: () => void;
  onAddToCart?: (retailerId: string) => void;
  onBuyNow?: (retailerId: string) => void;
}

function RetailerCard({ result, onClose, onAddToCart, onBuyNow }: RetailerCardProps) {
  const { t } = useTranslation();
  const { retailer, stock, distanceM: d } = result;
  function openMaps() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${retailer.lat},${retailer.lng}`, '_blank');
  }
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, position: 'relative' }}>
      {onClose && (
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShopIcon size={20} color="#16a34a" strokeWidth={1.9} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{retailer.businessName}</div>
          <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <Star size={11} fill="#f59e0b" stroke="none" />
            <span style={{ fontWeight: 600, color: '#374151' }}>{retailer.rating.toFixed(1)}</span>
            <span>· {retailer.city}</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>· {formatDistance(d)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#16a34a' }}>₹{stock.price}</div>
          {stock.mrp > stock.price && <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>₹{stock.mrp}</div>}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{retailer.addressLine}, {retailer.city} — {retailer.pincode}</div>

      {stock.inStock ? (
        <div style={{ fontSize: 11, color: '#15803d', fontWeight: 700, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} /> {t('product.inStockUnits', { count: stock.quantity })}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginBottom: 10 }}>✗ {t('common.outOfStock')}</div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: stock.inStock && (onAddToCart || onBuyNow) ? 8 : 0 }}>
        <a href={`tel:${retailer.phone}`} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}>
          <Phone size={13} /> {t('actions.call')}
        </a>
        {retailer.whatsapp && (
          <a href={`https://wa.me/${retailer.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#f0fff4', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}>
            <MessageCircle size={13} /> {t('actions.whatsapp')}
          </a>
        )}
        <button onClick={openMaps} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer' }}>
          <Navigation size={13} /> {t('actions.directions')}
        </button>
      </div>

      {stock.inStock && (onAddToCart || onBuyNow) && (
        <div style={{ display: 'flex', gap: 8 }}>
          {onAddToCart && (
            // TEMP_DISABLED: Cart feature disabled temporarily
            <button
              onClick={() => onAddToCart(retailer.id)}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#9ca3af', cursor: 'not-allowed', opacity: 0.6 }}
            >
              <ShoppingCart size={13} /> Coming Soon
            </button>
          )}
          {onBuyNow && (
            // TEMP_DISABLED: Cart feature disabled temporarily
            <button
              onClick={() => onBuyNow(retailer.id)}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 12px', background: '#9ca3af', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'not-allowed', opacity: 0.6 }}
            >
              <Zap size={13} /> Coming Soon
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RetailerRow({ result, onSelect, isSelected }: { result: StockResult; onSelect: () => void; isSelected: boolean }) {
  const { t } = useTranslation();
  const { retailer, stock, distanceM: d } = result;
  return (
    <button
      onClick={onSelect}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: isSelected ? '#f0fdf4' : '#f9fafb', border: `1px solid ${isSelected ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}
    >
      <ShopIcon size={18} color="#16a34a" strokeWidth={1.9} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{retailer.businessName}</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{retailer.city} · {formatDistance(d)}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {stock.inStock
          ? <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '2px 7px' }}>₹{stock.price}</span>
          : <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>{t('common.outOfStock')}</span>}
      </div>
    </button>
  );
}
