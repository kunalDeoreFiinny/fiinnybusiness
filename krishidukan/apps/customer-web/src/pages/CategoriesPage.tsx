import { useNavigate } from 'react-router-dom';
import { CATEGORIES, PRODUCTS, SHOP_INVENTORY } from '../demoData';

export function CategoriesPage() {
  const navigate = useNavigate();

  const categoriesWithCount = CATEGORIES.map((c) => {
    const productCount = PRODUCTS.filter((p) => p.category === c.id).length;
    const stockCount = SHOP_INVENTORY.filter((i) => {
      const prod = PRODUCTS.find((p) => p.id === i.productId);
      return prod?.category === c.id && i.inStock;
    }).length;
    return { ...c, productCount, stockCount };
  });

  return (
    <div>
      <div style={{ background: '#fff', padding: '16px 16px 12px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>All Categories</h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Browse agri-inputs by type</p>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categoriesWithCount.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/search?category=${c.id}`)}
              style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                padding: 16, cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: `${c.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
              }}>
                {c.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {c.productCount} product{c.productCount !== 1 ? 's' : ''} · {c.stockCount} in-stock listings
                </div>
              </div>
              <div style={{ fontSize: 20, color: '#d1d5db' }}>›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
