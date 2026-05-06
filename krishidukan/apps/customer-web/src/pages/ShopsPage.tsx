import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Star, Navigation } from 'lucide-react';
import { SHOPS, distanceM, formatDistance } from '../demoData';
import { useLocation } from '../LocationContext';

export function ShopsPage() {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [query, setQuery] = useState('');

  const shops = useMemo(() => {
    const q = query.toLowerCase().trim();
    return SHOPS
      .map((s) => ({ shop: s, d: distanceM(location.lat, location.lng, s.lat, s.lng) }))
      .filter(({ shop }) => !q || shop.businessName.toLowerCase().includes(q) || shop.city.toLowerCase().includes(q))
      .sort((a, b) => a.d - b.d);
  }, [query, location.lat, location.lng]);

  function openDirections(e: React.MouseEvent, shop: typeof SHOPS[number]) {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`, '_blank');
  }

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 16px 12px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 60, zIndex: 30 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Shops Near You</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 10, padding: '10px 14px' }}>
          <Search size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shops by name or city..."
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827' }}
          />
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
          {shops.length} shop{shops.length !== 1 ? 's' : ''} found near <strong>{location.label}</strong>
        </p>

        {shops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏪</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No shops found</p>
            <p style={{ fontSize: 13 }}>Try a different search term</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {shops.map(({ shop, d }) => (
              <div
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    🏪
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {shop.businessName}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Star size={11} fill="#f59e0b" stroke="none" />
                      <span style={{ fontWeight: 600, color: '#374151' }}>{shop.rating.toFixed(1)}</span>
                      <span>({shop.totalRatings})</span>
                      <span>·</span>
                      <span>{shop.city}</span>
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
                    style={{
                      flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0',
                      borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none',
                    }}
                  >
                    <Phone size={13} /> Call
                  </a>
                  <button
                    onClick={(e) => openDirections(e, shop)}
                    style={{
                      flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer',
                    }}
                  >
                    <Navigation size={13} /> Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
