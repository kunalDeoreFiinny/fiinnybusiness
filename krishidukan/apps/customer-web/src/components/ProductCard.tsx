import { useNavigate } from 'react-router-dom';
import { Clock3 } from 'lucide-react';
import { Product, RETAILER_STOCK } from '../demoData';
import { productIcon } from './icons';

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const Icon = productIcon(product.id);
  const stocking = RETAILER_STOCK.filter((i) => i.productId === product.id && i.inStock).length;
  const prices = RETAILER_STOCK.filter((i) => i.productId === product.id).map((i) => i.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <button
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: '#fff', border: '1px solid #eef0f3', borderRadius: 16,
        padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div style={{
        height: 120,
        background: `linear-gradient(135deg, ${product.imageColor}12, ${product.imageColor}28)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <Icon size={48} color={product.imageColor} strokeWidth={1.7} />
        {stocking > 0 && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: '#16a34a', color: '#fff',
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            <Clock3 size={10} strokeWidth={2.5} /> Today
          </span>
        )}
      </div>
      <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
          {product.categoryLabel}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 34 }}>
          {product.shortName}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 10 }}>
          {product.packSizes.slice(0, 2).join(' · ')}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {minPrice > 0 ? `₹${minPrice}` : '—'}
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{stocking} {stocking === 1 ? 'shop' : 'shops'}</div>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#f0fdf4', color: '#15803d',
            border: '1px solid #bbf7d0', borderRadius: 8,
            fontSize: 12, fontWeight: 700, padding: '6px 10px',
          }}>
            ADD
          </span>
        </div>
      </div>
    </button>
  );
}
