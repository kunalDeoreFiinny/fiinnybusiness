import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Star, Clock, Package } from 'lucide-react';
import { SHOPS, getShopProducts, formatDistance, distanceM } from '../demoData';
import { useLocation } from '../LocationContext';

export function ShopPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location } = useLocation();

  const shop = SHOPS.find((s) => s.id === id);
  const products = useMemo(() => (id ? getShopProducts(id) : []), [id]);

  if (!shop) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#dc2626', fontSize: 14 }}>Shop not found</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 12, padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          Back to home
        </button>
      </div>
    );
  }

  const d = distanceM(location.lat, location.lng, shop.lat, shop.lng);
  const inStockProducts = products.filter((p) => p.inventory.inStock);

  function openDirections() {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`, '_blank');
  }

  return (
    <div>
      {/* Back nav */}
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {shop.businessName}
        </span>
      </div>

      {/* Shop hero */}
      <section style={{ background: '#fff', padding: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
            🏪
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>
              {shop.businessName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12, color: '#6b7280' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Star size={12} fill="#f59e0b" stroke="none" />
                <span style={{ fontWeight: 700, color: '#374151' }}>{shop.rating.toFixed(1)}</span>
                <span>({shop.totalRatings} ratings)</span>
              </span>
              <span>·</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatDistance(d)} away</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: '#f9fafb', borderRadius: 10, marginBottom: 12 }}>
          <MapPin size={14} style={{ color: '#6b7280', marginTop: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{shop.addressLine}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{shop.city}, {shop.state} — {shop.pincode}</div>
          </div>
        </div>

        {/* Hours */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f9fafb', borderRadius: 10, marginBottom: 16 }}>
          <Clock size={14} style={{ color: '#6b7280' }} />
          <span style={{ fontSize: 12, color: '#374151' }}>{shop.openHours}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '2px 8px' }}>
            Open
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={`tel:${shop.phone}`}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 16px', background: '#16a34a', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <Phone size={15} /> Call Shop
          </a>
          <button
            onClick={openDirections}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer',
            }}
          >
            <Navigation size={15} /> Directions
          </button>
        </div>
      </section>

      {/* Products in stock */}
      <section style={{ padding: '20px 16px 8px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Products Available
        </h2>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
          {inStockProducts.length} products in stock
        </p>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: 12, color: '#9ca3af' }}>
            <Package size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
            <p style={{ fontSize: 14 }}>No products listed</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {products.map(({ product, inventory }) => (
              <button
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                  padding: 14, cursor: 'pointer', textAlign: 'left',
                  display: 'flex', gap: 12, alignItems: 'center',
                  opacity: inventory.inStock ? 1 : 0.55,
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: `linear-gradient(135deg, ${product.imageColor}15, ${product.imageColor}30)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0,
                }}>
                  {product.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: product.imageColor, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                    {product.brand}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                  </div>
                  {inventory.inStock ? (
                    <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                      {inventory.quantity} units in stock
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>Out of stock</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>₹{inventory.price}</div>
                  {inventory.mrp > inventory.price && (
                    <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>₹{inventory.mrp}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Shop info footer */}
      <section style={{ padding: '20px 16px 32px' }}>
        <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Shop Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>Owner</span>
              <span style={{ color: '#111827', fontWeight: 500 }}>{shop.ownerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>Phone</span>
              <a href={`tel:${shop.phone}`} style={{ color: '#16a34a', fontWeight: 500, textDecoration: 'none' }}>{shop.phone}</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>City</span>
              <span style={{ color: '#111827', fontWeight: 500 }}>{shop.city}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>License verified</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Yes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
