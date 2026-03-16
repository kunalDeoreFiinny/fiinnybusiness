import { useState, useEffect } from 'react';
import { addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { Package, Plus, AlertTriangle, CheckCircle2, Loader2, Trash2, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BatchItem {
  id: string;
  productName: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  mrp: number;
  purchaseRate: number;
  quantity: number;
  unit: string;
  supplier: string;
  storageLocation: string;
  hsnCode: string;
  notes: string;
  createdAt?: any;
}

function daysUntilExpiry(expiryDate: string): number {
  if (!expiryDate) return 999;
  const expiry = new Date(expiryDate);
  const today = new Date();
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryStatus(days: number): { label: string; color: string; bg: string } {
  if (days < 0) return { label: 'Expired', color: '#ef4444', bg: 'hsla(0,84%,60%,0.1)' };
  if (days <= 30) return { label: `${days}d left`, color: '#ef4444', bg: 'hsla(0,84%,60%,0.08)' };
  if (days <= 90) return { label: `${days}d left`, color: '#f59e0b', bg: 'hsla(38,92%,50%,0.08)' };
  return { label: `${days}d left`, color: '#10b981', bg: 'transparent' };
}

const EMPTY_FORM = () => ({
  productName: '', batchNumber: '', mfgDate: '', expiryDate: '',
  mrp: 0, purchaseRate: 0, quantity: 0, unit: 'Nos', supplier: '',
  storageLocation: '', hsnCode: '', notes: '',
});

export default function InventoryBatchPage() {
  const { tenantId } = useAuth();
  const { t } = useTranslation();
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'expiring' | 'expired'>('all');
  const [form, setForm] = useState(EMPTY_FORM());

  const fetchBatches = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(getTenantCollection(db, tenantId, 'inventoryBatches'), orderBy('createdAt', 'desc')));
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() } as BatchItem)));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBatches(); }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId || !form.productName) return;
    setSaving(true);
    try {
      await addDoc(getTenantCollection(db, tenantId, 'inventoryBatches'), {
        ...form, mrp: Number(form.mrp), purchaseRate: Number(form.purchaseRate),
        quantity: Number(form.quantity), createdAt: serverTimestamp(),
      });
      setShowForm(false);
      setForm(EMPTY_FORM());
      fetchBatches();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!tenantId || !window.confirm('Delete this batch?')) return;
    await deleteDoc(getTenantDoc(db, tenantId, 'inventoryBatches', id) as any);
    fetchBatches();
  };

  const updateQty = async (id: string, qty: number) => {
    if (!tenantId) return;
    await updateDoc(getTenantDoc(db, tenantId, 'inventoryBatches', id) as any, { quantity: qty });
    fetchBatches();
  };

  const filtered = batches.filter(b => {
    const matchSearch = !search || b.productName.toLowerCase().includes(search.toLowerCase()) || b.batchNumber.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'expiring') return matchSearch && daysUntilExpiry(b.expiryDate) <= 90 && daysUntilExpiry(b.expiryDate) >= 0;
    if (filterStatus === 'expired') return matchSearch && daysUntilExpiry(b.expiryDate) < 0;
    return matchSearch;
  });

  const expiredCount = batches.filter(b => daysUntilExpiry(b.expiryDate) < 0).length;
  const expiringCount = batches.filter(b => { const d = daysUntilExpiry(b.expiryDate); return d >= 0 && d <= 30; }).length;

  const card = { background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '14px', padding: '1.5rem' };
  const inputStyle = { marginBottom: 0 };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={32} /> {t('inventory_batches.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t('inventory_batches.desc')}</p>
        </div>
        <button onClick={() => setShowForm(f => !f)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, font: 'inherit' }}>
          <Plus size={17} /> {t('inventory_batches.add_batch')}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: t('inventory_batches.total_batches'), value: batches.length, color: '#6366f1', icon: <Package size={18} /> },
          { label: t('inventory_batches.expiring_soon'), value: expiringCount, color: '#f59e0b', icon: <AlertTriangle size={18} /> },
          { label: t('inventory_batches.expired'), value: expiredCount, color: '#ef4444', icon: <AlertTriangle size={18} /> },
          { label: t('inventory_batches.total_skus'), value: batches.reduce((s, b) => s + (b.quantity || 0), 0), color: '#10b981', icon: <CheckCircle2 size={18} /> },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderLeft: `4px solid ${s.color}`, borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: s.color, marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{s.icon}{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add Batch Form */}
      {showForm && (
        <div style={{ ...card, marginBottom: '1.5rem', border: '2px dashed var(--primary-light)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Add New Batch</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {[
              { key: 'productName', label: 'Product Name *', placeholder: 'e.g. Paracetamol 500mg', span: 2 },
              { key: 'batchNumber', label: 'Batch Number *', placeholder: 'e.g. BT2024001' },
              { key: 'mfgDate', label: 'Mfg Date', type: 'date' },
              { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
              { key: 'hsnCode', label: 'HSN / SAC Code', placeholder: 'e.g. 30049099' },
              { key: 'mrp', label: 'MRP (₹)', type: 'number', placeholder: '0.00' },
              { key: 'purchaseRate', label: 'Purchase Rate (₹)', type: 'number', placeholder: '0.00' },
              { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '0' },
              { key: 'unit', label: 'Unit', placeholder: 'Nos / Box / Kg' },
              { key: 'supplier', label: 'Supplier Name', placeholder: 'Supplier / Vendor' },
              { key: 'storageLocation', label: 'Storage Location', placeholder: 'Shelf A3 / Godown 1' },
            ].map(f => (
              <div key={f.key} className="input-group" style={{ gridColumn: (f as any).span ? `span ${(f as any).span}` : 'span 1' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.label}</label>
                <input
                  className="input-field"
                  style={inputStyle}
                  type={(f as any).type || 'text'}
                  placeholder={(f as any).placeholder || ''}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Notes</label>
            <textarea className="input-field" style={{ minHeight: '50px' }} placeholder="Storage conditions, remarks..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM()); }} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '10px', cursor: 'pointer', font: 'inherit', color: 'var(--text-secondary)' }}>{t('common.cancel')}</button>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.75rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, font: 'inherit' }}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} {t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' as const, flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute' as const, left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: '2.25rem', margin: 0 }}
            placeholder="Search by product or batch number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['all', 'expiring', 'expired'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', cursor: 'pointer', fontWeight: filterStatus === f ? 700 : 400, background: filterStatus === f ? 'var(--primary-light)' : 'transparent', color: filterStatus === f ? '#fff' : 'var(--text-secondary)', font: 'inherit', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={13} /> {f === 'all' ? t('inventory_batches.filter_all') : f === 'expiring' ? t('inventory_batches.filter_expiring') : t('inventory_batches.filter_expired')}
            </button>
          ))}
        </div>
      </div>

      {/* Batch List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={36} style={{ margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '4rem' }}>
          <Package size={52} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3>{batches.length === 0 ? t('inventory_batches.no_batches') : 'No Matches Found'}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {batches.length === 0 ? t('inventory_batches.no_batches_desc') : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filtered.map(b => {
            const days = daysUntilExpiry(b.expiryDate);
            const status = expiryStatus(days);
            return (
              <div key={b.id} style={{ ...card, padding: '1.1rem 1.4rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', borderLeft: `4px solid ${status.color}`, background: status.bg || 'var(--surface-raised)' }}>
                {/* Product Info */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>{b.productName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' as const }}>
                    <span>Batch: <strong>{b.batchNumber || '—'}</strong></span>
                    {b.hsnCode && <span>HSN: {b.hsnCode}</span>}
                    {b.supplier && <span>📦 {b.supplier}</span>}
                    {b.storageLocation && <span>📍 {b.storageLocation}</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {b.mfgDate && <span>Mfg: {b.mfgDate}</span>}
                    {b.expiryDate && <span style={{ marginLeft: '0.75rem' }}>Exp: {b.expiryDate}</span>}
                  </div>
                </div>
                {/* MRP & Rate */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MRP</div>
                  <div style={{ fontWeight: 700 }}>₹{Number(b.mrp || 0).toFixed(2)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Buy: ₹{Number(b.purchaseRate || 0).toFixed(2)}</div>
                </div>
                {/* Quantity */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qty in Stock</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <button onClick={() => updateQty(b.id, Math.max(0, b.quantity - 1))} style={{ width: 26, height: 26, border: '1px solid var(--surface-border)', borderRadius: '6px', cursor: 'pointer', background: 'var(--surface-base)', font: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontWeight: 800, fontSize: '1rem', minWidth: '2rem', textAlign: 'center' as const }}>{b.quantity}</span>
                    <button onClick={() => updateQty(b.id, b.quantity + 1)} style={{ width: 26, height: 26, border: '1px solid var(--surface-border)', borderRadius: '6px', cursor: 'pointer', background: 'var(--surface-base)', font: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{b.unit}</span>
                  </div>
                </div>
                {/* Expiry Status */}
                <div style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', background: status.color + '18', color: status.color, fontWeight: 700, fontSize: '0.82rem', textAlign: 'center' as const, display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                  {days < 0 ? '☠️' : days <= 30 ? '⚠️' : days <= 90 ? '⏳' : '✅'} {status.label}
                </div>
                {/* Actions */}
                <button onClick={() => handleDelete(b.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: '4px', opacity: 0.6 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
