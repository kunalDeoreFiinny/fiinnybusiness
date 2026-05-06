import { useNavigate } from 'react-router-dom';
import { Product, RETAILER_STOCK, BRANDS } from '../demoData';

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const brand = BRANDS.find((b) => b.id === product.brandId);
  const stocking = RETAILER_STOCK.filter((i) => i.productId === product.id && i.inStock).length;
  const prices = RETAILER_STOCK.filter((i) => i.productId === product.id).map((i) => i.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <button
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        height: 110, background: `linear-gradient(135deg, ${product.imageColor}15, ${product.imageColor}30)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 48 }}>{product.emoji}</span>
      </div>
      <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: brand?.color ?? product.imageColor, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
          {brand?.name ?? product.brandId}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.shortName}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
            {minPrice > 0 ? `from ₹${minPrice}` : 'See price'}
          </span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            {stocking} {stocking === 1 ? 'retailer' : 'retailers'}
          </span>
        </div>
      </div>
    </button>
  );
}
