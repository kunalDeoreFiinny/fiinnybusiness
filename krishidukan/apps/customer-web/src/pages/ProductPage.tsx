import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Star, Package } from 'lucide-react';
import { PRODUCTS, formatDistance, searchShopsForProduct } from '../demoData';
import { useLocation } from '../LocationContext';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location, requestGps, requesting } = useLocation();

  const product = PRODUCTS.find((p) => p.id === id);
  const shops = useMemo(
    () => (id ? searchShopsForProduct(id, location.lat, location.lng, 200) : []),
    [id, location.lat, location.lng],
  );

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

  const inStock = shops.filter((r) => r.inventory.inStock);
  const outOfStock = shops.filter((r) => !r.inventory.inStock);

  return (
    <div>
      {/* Back nav */}
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </span>
      </div>

      {/* Product hero */}
      <section style={{ padding: 16, background: '#fff' }}>
        <div style={{
          height: 200, background: `linear-gradient(135deg, ${product.imageColor}15, ${product.imageColor}30)`,
          borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <span style={{ fontSize: 96 }}>{product.emoji}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: product.imageColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          {product.brand}
        </div>
        <h1 style={{ fontSize: 19, fontWeight: 700, color: '#111827', lineHeight: 1.3, marginBottom: 8 }}>
          {product.name}
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{product.description}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '4px 10px', fontSize: 11, color: '#15803d', fontWeight: 600 }}>
          <Package size={12} /> {product.categoryLabel}
        </div>
      </section>

      {/* Location info */}
      <section style={{ padding: '12px 16px', background: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={14} style={{ color: '#15803d' }} />
          <span style={{ fontSize: 12, color: '#15803d' }}>
            Showing shops near <strong>{location.label}</strong>
          </span>
        </div>
        {location.source !== 'gps' && (
          <button
            onClick={requestGps}
            disabled={requesting}
            style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {requesting ? 'Getting…' : 'Use my location'}
          </button>
        )}
      </section>

      {/* In-stock shops */}
      <section style={{ padding: '20px 16px 8px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
          {inStock.length > 0 ? `Available at ${inStock.length} ${inStock.length === 1 ? 'shop' : 'shops'} near you` : 'No shops have this in stock'}
        </h2>

        {inStock.length === 0 && outOfStock.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', color: '#9ca3af' }}>
            <p style={{ fontSize: 14, marginBottom: 4 }}>No shops carry this product within 200km.</p>
            <p style={{ fontSize: 12 }}>Try expanding your search area.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inStock.map(({ shop, inventory, distanceM }) => (
            <ShopRow key={shop.id} shop={shop} inventory={inventory} distanceM={distanceM} />
          ))}
        </div>
      </section>

      {/* Out of stock */}
      {outOfStock.length > 0 && (
        <section style={{ padding: '20px 16px 32px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>
            Currently out of stock ({outOfStock.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.6 }}>
            {outOfStock.map(({ shop, inventory, distanceM }) => (
              <ShopRow key={shop.id} shop={shop} inventory={inventory} distanceM={distanceM} dimmed />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ShopRow({
  shop, inventory, distanceM, dimmed = false,
}: {
  shop: ReturnType<typeof searchShopsForProduct>[number]['shop'];
  inventory: ReturnType<typeof searchShopsForProduct>[number]['inventory'];
  distanceM: number;
  dimmed?: boolean;
}) {
  const navigate = useNavigate();
  function openDirections(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`, '_blank');
  }
  return (
    <div
      onClick={() => navigate(`/shop/${shop.id}`)}
      style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: 14, cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 3 }}>
            {shop.businessName}
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Star size={11} fill="#f59e0b" stroke="none" />
              <span style={{ fontWeight: 600, color: '#374151' }}>{shop.rating.toFixed(1)}</span>
            </span>
            <span>·</span>
            <span>{shop.city}</span>
            <span>·</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatDistance(distanceM)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>
            ₹{inventory.price}
          </div>
          {inventory.mrp > inventory.price && (
            <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
              MRP ₹{inventory.mrp}
            </div>
          )}
        </div>
      </div>
      {!dimmed && inventory.inStock && (
        <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
          In stock — {inventory.quantity} units available
        </div>
      )}
      {dimmed && (
        <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginBottom: 10 }}>
          ✗ Out of stock
        </div>
      )}
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
          <Phone size={13} /> Call shop
        </a>
        <button
          onClick={openDirections}
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
  );
}
