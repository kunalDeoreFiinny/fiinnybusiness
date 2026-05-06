import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Star } from 'lucide-react';
import { CATEGORIES, PRODUCTS, SHOPS, distanceM, formatDistance } from '../demoData';
import { useLocation } from '../LocationContext';
import { ProductCard } from '../components/ProductCard';

export function HomePage() {
  const navigate = useNavigate();
  const { location, requestGps } = useLocation();

  const popular = [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
  const nearby = SHOPS
    .map((s) => ({ shop: s, d: distanceM(location.lat, location.lng, s.lat, s.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '32px 16px 48px',
        color: '#fff',
        position: 'relative',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.25, marginBottom: 8, letterSpacing: '-0.4px' }}>
          Genuine agri-inputs<br />from your nearest Krishi Seva Kendra
        </h1>
        <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>
          Real-time stock · Transparent prices · Direct from local shops
        </p>

        {/* Big search button */}
        <button
          onClick={() => {
            const event = new CustomEvent('open-search');
            window.dispatchEvent(event);
            navigate('/search');
          }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', color: '#9ca3af',
            border: 'none', borderRadius: 12, padding: '14px 16px',
            fontSize: 15, cursor: 'pointer', textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          <Search size={18} />
          <span>Search seeds, fertilizers, pesticides...</span>
        </button>

        {/* Location prompt */}
        {location.source === 'default' && (
          <button
            onClick={requestGps}
            style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}
          >
            <MapPin size={13} /> Set your location for accurate results
          </button>
        )}
      </section>

      {/* Categories grid */}
      <section style={{ padding: '24px 16px 8px', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Shop by Category</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/search?category=${c.id}`)}
              style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: '14px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {c.emoji}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#374151', textAlign: 'center', lineHeight: 1.2 }}>
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Popular products */}
      <section style={{ padding: '24px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Most Searched</h2>
          <button onClick={() => navigate('/search')} style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            See all
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Nearby shops */}
      <section style={{ padding: '24px 16px 32px', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Shops Near You</h2>
          <button onClick={() => navigate('/shops')} style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            See all
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nearby.map(({ shop, d }) => (
            <button
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.id}`)}
              style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: 14, display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                🏪
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shop.businessName}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} fill="#f59e0b" stroke="none" />
                    <span style={{ fontWeight: 600, color: '#374151' }}>{shop.rating.toFixed(1)}</span>
                    <span style={{ color: '#9ca3af' }}>({shop.totalRatings})</span>
                  </span>
                  <span>·</span>
                  <span>{shop.city}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
                  {formatDistance(d)}
                </div>
                <a
                  href={`tel:${shop.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b7280', textDecoration: 'none' }}
                >
                  <Phone size={11} /> Call
                </a>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ padding: '24px 16px', background: '#fff', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { icon: '✓', title: 'License-verified', body: 'Every shop is reviewed by us before going live.' },
            { icon: '🔄', title: 'Live stock', body: 'Inventory updates within seconds of a sale.' },
            { icon: '₹', title: 'No middlemen', body: 'You buy directly from the local shop owner.' },
            { icon: '📞', title: 'Direct contact', body: 'Call or get directions in one tap.' },
          ].map((item) => (
            <div key={item.title}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
