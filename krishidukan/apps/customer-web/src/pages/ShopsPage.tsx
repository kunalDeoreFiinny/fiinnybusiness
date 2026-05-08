import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Star, Navigation, MessageCircle, Map, List } from 'lucide-react';
import { formatDistance } from '../demoData';
import type { StockResult } from '../demoData';
import { useLocation } from '../LocationContext';
import { useNearbyShops } from '../hooks/useNearbyShops';
import { ShopRowSkeleton } from '../components/SkeletonLoader';
import { RetailerMap } from '../components/RetailerMap';
import { relativeTime } from '../hooks/useFormatTime';

type ViewMode = 'list' | 'map';

export function ShopsPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const { data, loading } = useNearbyShops(location.lat, location.lng);

  const shops = useMemo(() => {
    const q = query.toLowerCase().trim();
    const all = data?.shops ?? [];
    if (!q) return all;
    return all.filter(({ retailer }) =>
      retailer.businessName.toLowerCase().includes(q) ||
      retailer.city.toLowerCase().includes(q) ||
      retailer.district.toLowerCase().includes(q) ||
      retailer.villages.some((v) => v.toLowerCase().includes(q))
    );
  }, [data, query]);

  // The map needs StockResult-shaped objects so it can render the in-stock badge.
  // For the all-shops view we don't have a product context — feed it synthetic stock to satisfy the type.
  const mapResults: StockResult[] = useMemo(() => shops.map(({ retailer, distanceM: d }) => ({
    retailer,
    distanceM: d,
    stock: { retailerId: retailer.id, productId: '__any__', price: 0, mrp: 0, inStock: true, quantity: 0 },
  })), [shops]);

  function openDirections(e: React.MouseEvent, lat: number, lng: number) {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 16px 12px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 60, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Shops Near You</h1>
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 2, gap: 2 }}>
            <button
              onClick={() => setView('list')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: view === 'list' ? '#fff' : 'transparent', color: view === 'list' ? '#111827' : '#6b7280', boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              <List size={13} /> List
            </button>
            <button
              onClick={() => setView('map')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: view === 'map' ? '#fff' : 'transparent', color: view === 'map' ? '#111827' : '#6b7280', boxShadow: view === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              <Map size={13} /> Map
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 10, padding: '10px 14px' }}>
          <Search size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, village, city or district..."
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827' }}
          />
        </div>
      </div>

      {/* Map view */}
      {view === 'map' && (
        <div style={{ height: 'calc(100vh - 60px - 110px - 60px)', minHeight: 360, position: 'relative', background: '#e5e7eb' }}>
          <RetailerMap
            results={mapResults}
            userLat={location.lat}
            userLng={location.lng}
            onSelect={(r) => navigate(`/retailer/${r.id}`)}
            selected={null}
          />
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
            {loading && !data
              ? 'Looking for shops near you…'
              : `${shops.length} shop${shops.length !== 1 ? 's' : ''} found near `}
            {!loading || data ? <strong>{location.label}</strong> : null}
          </p>

          {data && (
            <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 14 }}>
              {data.scope === 'radius' && data.radiusKm > 0 && `Within ${data.radiusKm} km`}
              {data.scope === 'district' && `Showing district-wide results`}
              {data.scope === 'state' && `Showing all shops in your state`}
              {data.fromCache && data.cachedAt && (
                <span style={{ marginLeft: 6, color: '#92400e' }}>· Last updated {relativeTime(data.cachedAt)}</span>
              )}
            </p>
          )}

          {loading && !data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ShopRowSkeleton />
              <ShopRowSkeleton />
              <ShopRowSkeleton />
            </div>
          ) : shops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏪</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No shops match</p>
              <p style={{ fontSize: 13 }}>Try a different search term</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shops.map(({ retailer: shop, distanceM: d }) => (
                <div
                  key={shop.id}
                  onClick={() => navigate(`/retailer/${shop.id}`)}
                  style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🏪</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shop.businessName}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <Star size={11} fill="#f59e0b" stroke="none" />
                        <span style={{ fontWeight: 600, color: '#374151' }}>{shop.rating.toFixed(1)}</span>
                        <span>({shop.totalRatings})</span>
                        <span>·</span>
                        <span>{shop.city}</span>
                        <span>·</span>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>● In Stock</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', flexShrink: 0 }}>
                      {formatDistance(d)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{shop.addressLine}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href={`tel:${shop.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}
                    >
                      <Phone size={13} /> Call
                    </a>
                    {shop.whatsapp && (
                      <a
                        href={`https://wa.me/${shop.whatsapp.replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', background: '#f0fff4', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    )}
                    <button
                      onClick={(e) => openDirections(e, shop.lat, shop.lng)}
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer' }}
                    >
                      <Navigation size={13} /> Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
