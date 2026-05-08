import { Phone, MessageCircle, Navigation, Star, ShoppingCart, Zap } from 'lucide-react';
import type { StockResult } from '../demoData';
import { formatDistance } from '../utils/distance';

export interface RetailerCardProps {
  result: StockResult;
  /** Show a close (✕) button — used when the card floats over the map. */
  onClose?: () => void;
  onAddToCart?: (retailerId: string) => void;
  onBuyNow?: (retailerId: string) => void;
}

export function RetailerCard({ result, onClose, onAddToCart, onBuyNow }: RetailerCardProps) {
  const { retailer, stock, distanceM: d } = result;

  function openMaps() {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${retailer.lat},${retailer.lng}`,
      '_blank',
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, position: 'relative' }}>
      {onClose && (
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, padding: 4 }}
        >
          ✕
        </button>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          🏪
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
          {stock.mrp > stock.price && (
            <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>₹{stock.mrp}</div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
        {retailer.addressLine}, {retailer.city} — {retailer.pincode}
      </div>

      {/* Stock badge */}
      {stock.inStock ? (
        <div style={{ fontSize: 11, color: '#15803d', fontWeight: 700, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          In stock · {stock.quantity} units
        </div>
      ) : (
        <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginBottom: 10 }}>✗ Out of stock</div>
      )}

      {/* Action buttons row 1: contact + directions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: stock.inStock && (onAddToCart || onBuyNow) ? 8 : 0 }}>
        <a
          href={`tel:${retailer.phone}`}
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}
        >
          <Phone size={13} /> Call
        </a>
        {retailer.whatsapp && (
          <a
            href={`https://wa.me/${retailer.whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#f0fff4', border: '1px solid #86efac', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#15803d', textDecoration: 'none' }}
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
        )}
        <button
          onClick={openMaps}
          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1d4ed8', cursor: 'pointer' }}
        >
          <Navigation size={13} /> Directions
        </button>
      </div>

      {/* Action buttons row 2: cart + buy now */}
      {stock.inStock && (onAddToCart || onBuyNow) && (
        <div style={{ display: 'flex', gap: 8 }}>
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(retailer.id)}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 12px', background: '#fff', border: '1px solid #16a34a', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#16a34a', cursor: 'pointer' }}
            >
              <ShoppingCart size={13} /> Add to Cart
            </button>
          )}
          {onBuyNow && (
            <button
              onClick={() => onBuyNow(retailer.id)}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 12px', background: '#16a34a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
            >
              <Zap size={13} /> Buy Now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
