import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CATEGORIES, searchProducts } from '../demoData';
import { ProductCard } from '../components/ProductCard';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';

  const results = useMemo(() => searchProducts(q, category), [q, category]);

  function setCategory(c: string) {
    const next = new URLSearchParams(params);
    if (c) next.set('category', c); else next.delete('category');
    setParams(next, { replace: true });
  }

  return (
    <div>
      {/* Search bar */}
      <div style={{ background: '#fff', padding: 12, borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 60, zIndex: 30 }}>
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f3f4f6', borderRadius: 10, padding: '10px 14px',
            cursor: 'text', fontSize: 14, color: q ? '#111827' : '#9ca3af',
          }}
        >
          <Search size={16} style={{ color: '#9ca3af' }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {q || 'Search products...'}
          </span>
          {q && (
            <button
              onClick={(e) => { e.stopPropagation(); setParams(category ? { category } : {}); }}
              style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12 }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
          <button
            onClick={() => setCategory('')}
            style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', borderColor: !category ? '#16a34a' : '#e5e7eb', background: !category ? '#f0fdf4' : '#fff', color: !category ? '#15803d' : '#6b7280' }}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 16, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', borderColor: category === c.id ? '#16a34a' : '#e5e7eb', background: category === c.id ? '#f0fdf4' : '#fff', color: category === c.id ? '#15803d' : '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
          {results.length} product{results.length !== 1 ? 's' : ''} found
          {category && ` in ${CATEGORIES.find((c) => c.id === category)?.label}`}
          {q && ` for "${q}"`}
        </p>

        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No products found</p>
            <p style={{ fontSize: 13 }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
