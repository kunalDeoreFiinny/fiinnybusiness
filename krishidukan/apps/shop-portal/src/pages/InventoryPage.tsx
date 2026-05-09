import { useEffect, useState } from 'react';
import { api } from '../api';
import { ProductCategory, CATEGORY_LABELS } from '@krishidukan/shared';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Plus, Trash2, PackageX, Search } from 'lucide-react';

interface Product { id: string; name: string; brand: string | null; category: ProductCategory }
interface InventoryItem {
  id: string; productId: string; price: number; mrp: number;
  quantity: number; inStock: boolean; product: Product;
}

const INPUT: React.CSSProperties = { padding: '9px 12px', border: '1px solid var(--kd-border)', borderRadius: 'var(--kd-radius-md)', fontSize: 13, width: '100%', fontFamily: 'var(--kd-font)', outline: 'none' };

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<ProductCategory | ''>('');
  const [adding, setAdding] = useState<{ product: Product; price: string; mrp: string; qty: string } | null>(null);
  const [saving, setSaving] = useState('');

  useEffect(() => { void loadInventory(); void loadProducts(); }, []);

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
      await api.put(`/inventory/${adding.product.id}`, { price: parseFloat(adding.price), mrp: parseFloat(adding.mrp), quantity: parseInt(adding.qty) });
      setAdding(null);
      await loadInventory();
    } finally { setSaving(''); }
  }
  async function removeItem(productId: string) {
    if (!confirm('Remove this product from your listing?')) return;
    await api.delete(`/inventory/${productId}`);
    await loadInventory();
  }

  const inIds = new Set(inventory.map((i) => i.productId));
  const available = products.filter(
    (p) => !inIds.has(p.id) && (catFilter === '' || p.category === catFilter) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand ?? '').toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <AppShell title="Manage Inventory" subtitle={`${inventory.length} products listed`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Current Inventory */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Your Listed Products</h2>
            <Badge variant={inventory.length > 0 ? 'success' : 'neutral'}>{inventory.length} items</Badge>
          </div>
          {inventory.length === 0 ? (
            <Card>
              <EmptyState icon={<PackageX size={28} />} title="No products listed" description="Add products from the catalogue on the right." />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inventory.map((item) => (
                <Card key={item.id} padding="sm" hover>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{item.product.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--kd-text-muted)', marginTop: 2 }}>
                        {item.product.brand} · ₹{item.price} <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>₹{item.mrp}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Badge variant={item.inStock ? 'success' : 'danger'} dot>
                          {item.inStock ? `In stock (${item.quantity})` : 'Out of stock'}
                        </Badge>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => void removeItem(item.productId)} style={{ background: 'none', border: 'none', color: 'var(--kd-danger)', cursor: 'pointer', padding: 6, borderRadius: 'var(--kd-radius-sm)', display: 'flex' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--kd-danger-light)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add from Catalogue */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Add from Catalogue</h2>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--kd-text-muted)' }} />
            <input style={{ ...INPUT, paddingLeft: 34 }} placeholder="Search product or brand..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select style={{ ...INPUT, marginBottom: 14 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value as ProductCategory | '')}>
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {adding && (
            <Card style={{ marginBottom: 14, background: 'var(--kd-primary-light)', border: '1px solid var(--kd-primary-border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--kd-green-900)', marginBottom: 10 }}>Add: {adding.product.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={{ fontSize: 11, color: 'var(--kd-text-muted)' }}>Price (₹)</label><input style={INPUT} value={adding.price} onChange={(e) => setAdding({ ...adding, price: e.target.value })} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--kd-text-muted)' }}>MRP (₹)</label><input style={INPUT} value={adding.mrp} onChange={(e) => setAdding({ ...adding, mrp: e.target.value })} /></div>
                <div><label style={{ fontSize: 11, color: 'var(--kd-text-muted)' }}>Qty</label><input style={INPUT} value={adding.qty} onChange={(e) => setAdding({ ...adding, qty: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={() => void saveItem()} loading={!!saving} fullWidth>Save</Button>
                <Button variant="outline" onClick={() => setAdding(null)}>Cancel</Button>
              </div>
            </Card>
          )}

          <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {available.map((p) => (
              <Card key={p.id} padding="sm" hover onClick={() => setAdding({ product: p, price: '', mrp: '', qty: '' })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--kd-text-muted)' }}>{p.brand} · {CATEGORY_LABELS[p.category]}</div>
                  </div>
                  <Button variant="secondary" size="sm" icon={<Plus size={12} />}>Add</Button>
                </div>
              </Card>
            ))}
            {available.length === 0 && <div style={{ color: 'var(--kd-text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>No products found</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
