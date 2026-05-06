import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Star, List, Map, MessageCircle } from 'lucide-react';
import { PRODUCTS, BRANDS, getRetailersForProduct, formatDistance } from '../demoData';
import type { Retailer } from '../demoData';
import { useLocation } from '../LocationContext';
import { RetailerMap } from '../components/RetailerMap';

type ViewMode = 'map' | 'list';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location, requestGps, requesting } = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);

  const product = PRODUCTS.find((p) => p.id === id);
  const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;
  const results = useMemo(
    () => (id ? getRetailersForProduct(id, location.lat, location.lng) : []),
    [id, location.lat, location.lng],
  );
  const inStock = results.filter((r) => r.stock.inStock);
  const outOfStock = results.filter((r) => !r.stock.inStock);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Back nav */}
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.shortName}
        </span>
        {/* Map / List toggle */}
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

      {/* Product hero card */}
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

        {/* Benefits */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {product.benefits.map((b) => (
            <span key={b} style={{ fontSize: 11, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '3px 8px', fontWeight: 500 }}>
              ✓ {b}
            </span>
          ))}
        </div>

        {/* Pack sizes */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Available in:</span>
          {product.packSizes.map((s) => (
            <span key={s} style={{ fontSize: 11, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px' }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Location bar */}
      <div style={{ padding: '10px 16px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={13} style={{ color: '#15803d' }} />
          <span style={{ fontSize: 12, color: '#15803d' }}>
            Near <strong>{location.label}</strong> · {inStock.length} in stock
          </span>
        </div>
        {location.source !== 'gps' && (
          <button onClick={requestGps} disabled={requesting} style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            {requesting ? 'Getting…' : 'Use my GPS'}
          </button>
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

          {/* Selected retailer drawer */}
          {selectedRetailer ? (
            <RetailerCard
              result={results.find((r) => r.retailer.id === selectedRetailer.id)!}
              onClose={() => setSelectedRetailer(null)}
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

          {/* Quick list below map */}
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
          {inStock.length === 0 && outOfStock.length === 0 ? (
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
                    {inStock.map((r) => <RetailerCard key={r.retailer.id} result={r} />)}
                  </div>
                </>
              )}
              {outOfStock.length > 0 && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 10 }}>OUT OF STOCK ({outOfStock.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.6 }}>
                    {outOfStock.map((r) => <RetailerCard key={r.retailer.id} result={r} />)}
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

function RetailerCard({ result, onClose }: { result: StockResult; onClose?: () => void }) {
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
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏪</div>
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
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} /> In stock · {stock.quantity} units
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginBottom: 10 }}>✗ Out of stock</div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <a href={`tel:${retailer.phone}`} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}>
          <Phone size={13} /> Call
        </a>
        {retailer.whatsapp && (
          <a href={`https://wa.me/${retailer.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#f0fff4', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}>
            <MessageCircle size={13} /> WhatsApp
          </a>
        )}
        <button onClick={openMaps} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer' }}>
          <Navigation size={13} /> Directions
        </button>
      </div>
    </div>
  );
}

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

// Re-export type for use in this file
type StockResult = ReturnType<typeof getRetailersForProduct>[number];
