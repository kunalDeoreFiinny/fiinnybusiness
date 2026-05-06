import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { ProductCategory, CATEGORY_LABELS } from '@krishidukan/shared';
import { Plus, Trash2, PackageX } from 'lucide-react';

interface Product { id: string; name: string; brand: string | null; category: ProductCategory }
interface InventoryItem {
  id: string;
  productId: string;
  price: number;
  mrp: number;
  quantity: number;
  inStock: boolean;
  product: Product;
}

const INPUT: React.CSSProperties = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, width: '100%' };

export function InventoryPage() {
  const { shop } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<ProductCategory | ''>('');
  const [adding, setAdding] = useState<{ product: Product; price: string; mrp: string; qty: string } | null>(null);
  const [saving, setSaving] = useState('');

  useEffect(() => {
    void loadInventory();
    void loadProducts();
  }, []);

  async function loadInventory() {
    const res = await api.get<InventoryItem[]>('/inventory/my-shop');
    setInventory(res.data);
  }

  async function loadProducts() {
    const res = await api.get<{ products: Product[] }>('/products', { params: { limit: 200 } });
    setProducts(res.data.products);
  }

  async function saveItem() {
    if (!adding) return;
    setSaving(adding.product.id);
    try {
      await api.put(`/inventory/${adding.product.id}`, {
        price: parseFloat(adding.price),
        mrp: parseFloat(adding.mrp),
        quantity: parseInt(adding.qty),
      });
      setAdding(null);
      await loadInventory();
    } finally {
      setSaving('');
    }
  }

  async function removeItem(productId: string) {
    if (!confirm('Remove this product from your listing?')) return;
    await api.delete(`/inventory/${productId}`);
    await loadInventory();
  }

  const inIds = new Set(inventory.map((i) => i.productId));
  const available = products.filter(
    (p) =>
      !inIds.has(p.id) &&
      (catFilter === '' || p.category === catFilter) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand ?? '').toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <a href="/dashboard" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none' }}>← Dashboard</a>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Manage Inventory</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>{inventory.length} products listed</span>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Current inventory */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Your Listed Products</h2>
          {inventory.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
              <PackageX size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14 }}>No products listed yet.</p>
              <p style={{ fontSize: 13 }}>Add products from the catalogue on the right.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inventory.map((item) => (
                <div key={item.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{item.product.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{item.product.brand} · ₹{item.price} (MRP ₹{item.mrp})</div>
                    <div style={{ fontSize: 12, color: item.inStock ? '#16a34a' : '#dc2626', marginTop: 2 }}>
                      {item.inStock ? `✓ In stock (${item.quantity} units)` : '✗ Out of stock'}
                    </div>
                  </div>
                  <button onClick={() => void removeItem(item.productId)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add from catalogue */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Add from Catalogue</h2>
          <input
            style={{ ...INPUT, marginBottom: 8 }}
            placeholder="Search product or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select style={{ ...INPUT, marginBottom: 14 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value as ProductCategory | '')}>
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {adding && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#14532d', marginBottom: 10 }}>Add: {adding.product.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={{ fontSize: 11, color: '#6b7280' }}>Your Price (₹)</label><input style={INPUT} value={adding.price} onChange={(e) => setAdding({ ...adding, price: e.target.value })} placeholder="Price" /></div>
                <div><label style={{ fontSize: 11, color: '#6b7280' }}>MRP (₹)</label><input style={INPUT} value={adding.mrp} onChange={(e) => setAdding({ ...adding, mrp: e.target.value })} placeholder="MRP" /></div>
                <div><label style={{ fontSize: 11, color: '#6b7280' }}>Qty</label><input style={INPUT} value={adding.qty} onChange={(e) => setAdding({ ...adding, qty: e.target.value })} placeholder="Qty" /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => void saveItem()} disabled={!!saving} style={{ flex: 1, padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setAdding(null)} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {available.map((p) => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.brand} · {CATEGORY_LABELS[p.category]}</div>
                </div>
                <button
                  onClick={() => setAdding({ product: p, price: '', mrp: '', qty: '' })}
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '5px 12px', color: '#16a34a', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            ))}
            {available.length === 0 && <div style={{ color: '#9ca3af', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No products found</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
