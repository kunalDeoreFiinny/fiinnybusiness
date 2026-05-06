import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Star, Clock, MessageCircle } from 'lucide-react';
import { RETAILERS, getRetailerProducts, formatDistance, distanceM } from '../demoData';
import { useLocation } from '../LocationContext';

export function RetailerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location } = useLocation();

  const retailer = RETAILERS.find((r) => r.id === id);
  const products = useMemo(() => (id ? getRetailerProducts(id) : []), [id]);

  if (!retailer) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontSize: 14 }}>Retailer not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 12, padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Back</button>
      </div>
    );
  }

  const r = retailer;
  const d = distanceM(location.lat, location.lng, r.lat, r.lng);

  function openMaps() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`, '_blank');
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {retailer.businessName}
        </span>
      </div>

      <section style={{ background: '#fff', padding: 16, borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🏪</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{retailer.businessName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', flexWrap: 'wrap' }}>
              <Star size={12} fill="#f59e0b" stroke="none" />
              <span style={{ fontWeight: 700, color: '#374151' }}>{retailer.rating.toFixed(1)}</span>
              <span>({retailer.totalRatings})</span>
              <span>·</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatDistance(d)} away</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#f9fafb', borderRadius: 10, marginBottom: 10 }}>
          <MapPin size={14} style={{ color: '#6b7280', marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, color: '#374151' }}>{retailer.addressLine}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{retailer.city}, {retailer.state} — {retailer.pincode}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f9fafb', borderRadius: 10, marginBottom: 16 }}>
          <Clock size={14} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: 12, color: '#374151' }}>{retailer.openHours}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`tel:${retailer.phone}`} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            <Phone size={15} /> Call
          </a>
          {retailer.whatsapp && (
            <a href={`https://wa.me/${retailer.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}>
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          <button onClick={openMaps} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer' }}>
            <Navigation size={15} /> Directions
          </button>
        </div>
      </section>

      <section style={{ padding: '16px 16px 32px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>KaranArjun PowerPlus Products Here</h2>
        {products.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '30px 0' }}>No products listed for this retailer</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.map(({ product, stock }) => (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'left', opacity: stock.inStock ? 1 : 0.55 }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 10, background: `linear-gradient(135deg, ${product.imageColor}15, ${product.imageColor}35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{product.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{product.shortName}</div>
                  {stock.inStock
                    ? <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />{stock.quantity} units in stock</div>
                    : <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Out of stock</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>₹{stock.price}</div>
                  {stock.mrp > stock.price && <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>₹{stock.mrp}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
