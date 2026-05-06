import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Star } from 'lucide-react';
import { PRODUCTS, BRANDS, RETAILERS, distanceM, formatDistance } from '../demoData';
import { useLocation } from '../LocationContext';

export function HomePage() {
  const navigate = useNavigate();
  const { location, requestGps } = useLocation();
  const brand = BRANDS[0]!;

  const nearby = RETAILERS
    .map((r) => ({ retailer: r, d: distanceM(location.lat, location.lng, r.lat, r.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        padding: '32px 16px 40px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 36 }}>{brand.emoji}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.8, textTransform: 'uppercase' }}>Official Store</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2 }}>{brand.name}</div>
          </div>
        </div>
        <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24, lineHeight: 1.6 }}>
          Find our products at your nearest retailer. Tap any product → see the map → get directions.
        </p>

        {/* Product quick-select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14,
                padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 28, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{p.shortName}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{p.categoryLabel} · {p.packSizes.join(', ')}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
                Find near me →
              </div>
            </button>
          ))}
        </div>

        {/* GPS prompt */}
        {location.source === 'default' && (
          <button
            onClick={requestGps}
            style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}
          >
            <MapPin size={13} /> Enable GPS for accurate retailer distances
          </button>
        )}
      </section>

      {/* How it works */}
      <section style={{ padding: '24px 16px', background: '#fff' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { step: '1', icon: '🌾', title: 'Pick product', body: 'Choose which PowerPlus product you need' },
            { step: '2', icon: '📍', title: 'See map', body: 'View all retailers near you on a live map' },
            { step: '3', icon: '🗺️', title: 'Get directions', body: 'One tap to open Google Maps navigation' },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 8px' }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby retailers */}
      <section style={{ padding: '20px 16px 32px', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Retailers Near You</h2>
          <button onClick={() => navigate('/retailers')} style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            See all
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nearby.map(({ retailer, d }) => (
            <button
              key={retailer.id}
              onClick={() => navigate(`/retailer/${retailer.id}`)}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏪</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{retailer.businessName}</div>
                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={11} fill="#f59e0b" stroke="none" />
                  <span style={{ fontWeight: 600, color: '#374151' }}>{retailer.rating.toFixed(1)}</span>
                  <span>· {retailer.city}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{formatDistance(d)}</div>
                <a href={`tel:${retailer.phone}`} onClick={(e) => e.stopPropagation()} style={{ marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#6b7280', textDecoration: 'none' }}>
                  <Phone size={11} /> Call
                </a>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section style={{ padding: '24px 16px', background: '#fff', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { icon: '⚡', title: 'Genuine products', body: 'Buy directly from verified local retailers.' },
            { icon: '📍', title: 'Real-time stock', body: 'Check availability before you travel.' },
            { icon: '📞', title: 'Call before you go', body: 'Confirm stock with one tap.' },
            { icon: '🗺️', title: 'Turn-by-turn nav', body: 'Google Maps directions in one tap.' },
          ].map((item) => (
            <div key={item.title}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
