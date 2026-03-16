import { useState, useEffect, useRef } from 'react';
import { getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { Barcode, Printer, Search, Plus, Loader2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name?: string;
  itemName?: string;
  productName?: string;
  price?: number;
  mrp?: number;
  rate?: number;
  sku?: string;
  hsnCode?: string;
  unit?: string;
}

interface BarcodeLabel {
  id: string;
  productName: string;
  price: string;
  mrp: string;
  sku: string;
  batchNumber: string;
  expiryDate: string;
  qty: number;
}

// Render a single barcode as SVG Code-128-ish bars (simplified visual barcode)
function BarcodeSVG({ value, width = 180, height = 50 }: { value: string; width?: number; height?: number }) {
  // Simple deterministic bar pattern based on character codes
  const chars = Array.from(value || 'SKU000');
  const bars: number[] = [];
  for (const c of chars) {
    const code = c.charCodeAt(0);
    bars.push(1, (code % 3) + 1, 2, (code % 2) + 1, 1, (code % 4) + 1, 3);
  }
  // Normalize to fit width
  const total = bars.reduce((a, b) => a + b, 0);
  const scale = (width - 10) / total;
  let x = 5;
  const rects: { x: number; w: number; fill: string }[] = [];
  bars.forEach((b, i) => {
    rects.push({ x, w: b * scale, fill: i % 2 === 0 ? '#000' : '#fff' });
    x += b * scale;
  });
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <rect width={width} height={height} fill="#fff"/>
      {rects.map((r, i) => <rect key={i} x={r.x} y={0} width={r.w} height={height} fill={r.fill}/>)}
    </svg>
  );
}

function LabelCard({ label, compact }: { label: BarcodeLabel; compact?: boolean }) {
  const sz = compact ? { w: 140, h: 36, font: 9, pFont: 11 } : { w: 200, h: 50, font: 10, pFont: 13 };
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '6px', padding: compact ? '6px 8px' : '10px 12px', background: '#fff', width: 'fit-content', fontFamily: 'monospace', color: '#000', breakInside: 'avoid' as const }}>
      <div style={{ fontWeight: 800, fontSize: sz.pFont, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: sz.w }}>{label.productName}</div>
      <BarcodeSVG value={label.sku || label.id} width={sz.w} height={sz.h} />
      <div style={{ fontSize: sz.font, textAlign: 'center' as const, letterSpacing: '0.05em', marginTop: '2px' }}>{label.sku || label.id.slice(0, 12)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: sz.font, marginTop: '4px' }}>
        <span>MRP: <strong>₹{label.mrp || label.price}</strong></span>
        {label.expiryDate && <span>Exp: {label.expiryDate}</span>}
      </div>
      {label.batchNumber && <div style={{ fontSize: sz.font - 1, color: '#666', marginTop: '2px' }}>Batch: {label.batchNumber}</div>}
    </div>
  );
}

export default function BarcodePage() {
  const { tenantId } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [labels, setLabels] = useState<BarcodeLabel[]>([]);
  const [customLabel, setCustomLabel] = useState({ productName: '', price: '', mrp: '', sku: '', batchNumber: '', expiryDate: '', qty: 1 });
  const [showCustom, setShowCustom] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    Promise.all([
      getDocs(query(getTenantCollection(db, tenantId, 'rateSheet'), orderBy('createdAt', 'desc'))).catch(() => ({ docs: [] as any[] })),
      getDocs(query(getTenantCollection(db, tenantId, 'inventoryBatches'), orderBy('createdAt', 'desc'))).catch(() => ({ docs: [] as any[] })),
    ]).then(([prodSnap, batchSnap]) => {
      setProducts((prodSnap as any).docs.map((d: any) => ({ id: d.id, ...d.data() })));
      setBatches((batchSnap as any).docs.map((d: any) => ({ id: d.id, ...d.data() })));
    }).catch(console.error).finally(() => setLoading(false));
  }, [tenantId]);

  const allItems = [
    ...products.map(p => ({
      id: p.id, productName: p.name || p.itemName || p.productName || 'Product',
      price: String(p.price || p.mrp || p.rate || 0), mrp: String(p.mrp || p.price || 0),
      sku: p.sku || p.id.slice(0, 8).toUpperCase(), batchNumber: '', expiryDate: '', qty: 1,
    })),
    ...batches.map(b => ({
      id: b.id, productName: b.productName || 'Product',
      price: String(b.purchaseRate || 0), mrp: String(b.mrp || 0),
      sku: b.batchNumber || b.id.slice(0, 8).toUpperCase(), batchNumber: b.batchNumber, expiryDate: b.expiryDate, qty: 1,
    })),
  ];

  const filteredItems = allItems.filter(i => !search || i.productName.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  const addToQueue = (item: typeof allItems[0], qty: number = 1) => {
    setLabels(prev => {
      const existing = prev.find(l => l.id === item.id);
      if (existing) return prev.map(l => l.id === item.id ? { ...l, qty: l.qty + qty } : l);
      return [...prev, { ...item, qty }];
    });
  };

  const removeFromQueue = (id: string) => setLabels(prev => prev.filter(l => l.id !== id));
  const updateQty = (id: string, qty: number) => setLabels(prev => prev.map(l => l.id === id ? { ...l, qty: Math.max(1, qty) } : l));

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Barcode Labels</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:monospace; padding:10px; background:#fff; }
      .grid { display:flex; flex-wrap:wrap; gap:6px; padding:4px; }
      .label { border:1px solid #ccc; border-radius:4px; padding:6px 8px; background:#fff; width:200px; break-inside:avoid; }
      .pname { font-weight:800; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .barcode { display:block; margin:4px 0 2px; }
      .code { font-size:9px; text-align:center; letter-spacing:0.04em; }
      .row { display:flex; justify-content:space-between; font-size:9px; margin-top:3px; }
      @media print { @page { margin:5mm; } }
    </style></head><body>
    <div class="grid">
    ${labels.flatMap(l => Array.from({ length: l.qty }).map(() => `
      <div class="label">
        <div class="pname">${l.productName}</div>
        <svg class="barcode" width="184" height="40">
          ${Array.from(l.sku || l.id).flatMap((c, _ci) => {
            const code = c.charCodeAt(0);
            const bars = [1, (code % 3) + 1, 2, (code % 2) + 1, 1, (code % 4) + 1, 3];
            const total = bars.reduce((a, b) => a + b, 0);
            const scale = 172 / total;
            let x = 6;
            return bars.map((b, bi) => {
              const rect = `<rect x="${x.toFixed(1)}" y="0" width="${(b * scale).toFixed(1)}" height="40" fill="${bi % 2 === 0 ? '#000' : '#fff'}"/>`;
              x += b * scale;
              return rect;
            });
          }).join('')}
        </svg>
        <div class="code">${l.sku || l.id.slice(0, 12)}</div>
        <div class="row"><span>MRP: <strong>₹${l.mrp || l.price}</strong></span>${l.expiryDate ? `<span>Exp: ${l.expiryDate}</span>` : ''}</div>
        ${l.batchNumber ? `<div style="font-size:8px;color:#666;margin-top:2px">Batch: ${l.batchNumber}</div>` : ''}
      </div>
    `)).join('')}
    </div>
    <script>setTimeout(()=>{window.print();},400);</script>
    </body></html>`);
    win.document.close();
  };

  const addCustom = () => {
    if (!customLabel.productName) return;
    setLabels(prev => [...prev, { id: `custom_${Date.now()}`, ...customLabel, qty: Number(customLabel.qty) || 1 }]);
    setCustomLabel({ productName: '', price: '', mrp: '', sku: '', batchNumber: '', expiryDate: '', qty: 1 });
    setShowCustom(false);
  };

  const card = { background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '14px', padding: '1.5rem' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Barcode size={32} /> {t('barcode.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t('barcode.desc')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowCustom(f => !f)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '10px', cursor: 'pointer', font: 'inherit', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <Plus size={16} /> {t('barcode.custom_label')}
          </button>
          <button onClick={handlePrint} disabled={labels.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: labels.length ? 'var(--primary-light)' : 'var(--surface-border)', color: '#fff', border: 'none', borderRadius: '10px', cursor: labels.length ? 'pointer' : 'not-allowed', fontWeight: 700, font: 'inherit' }}>
            <Printer size={17} /> {t('barcode.print_labels', { count: labels.reduce((s, l) => s + l.qty, 0) })}
          </button>
        </div>
      </div>

      {showCustom && (
        <div style={{ ...card, marginBottom: '1.5rem', border: '2px dashed var(--primary-light)' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Custom Label</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { key: 'productName', label: 'Product Name *', placeholder: 'Label text' },
              { key: 'sku', label: 'SKU / Code', placeholder: 'Will be barcoded' },
              { key: 'mrp', label: 'MRP (₹)', placeholder: '0.00' },
              { key: 'batchNumber', label: 'Batch No', placeholder: 'Optional' },
              { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
              { key: 'qty', label: 'Copies', type: 'number', placeholder: '1' },
            ].map(f => (
              <div key={f.key} className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.82rem' }}>{f.label}</label>
                <input className="input-field" style={{ margin: 0 }} type={(f as any).type || 'text'} placeholder={(f as any).placeholder || ''} value={(customLabel as any)[f.key]} onChange={e => setCustomLabel(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button onClick={addCustom} style={{ padding: '0.6rem 1.5rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, font: 'inherit' }}>{t('barcode.add_to_queue')}</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Product Selector */}
        <div>
          <div style={{ marginBottom: '1rem', position: 'relative' as const }}>
            <Search size={16} style={{ position: 'absolute' as const, left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input className="input-field" style={{ paddingLeft: '2.25rem', margin: 0 }} placeholder={t('barcode.search_products')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto' }} /></div>
          ) : filteredItems.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
              <Package size={40} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>{t('barcode.no_products')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto' as const, paddingRight: '0.25rem' }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{ ...card, padding: '0.9rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
                      <span>SKU: {item.sku}</span>
                      <span>MRP: ₹{item.mrp}</span>
                      {item.expiryDate && <span>Exp: {item.expiryDate}</span>}
                    </div>
                  </div>
                  <button onClick={() => addToQueue(item)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, font: 'inherit', fontSize: '0.82rem', whiteSpace: 'nowrap' as const }}>
                    <Barcode size={14} /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Print Queue */}
        <div style={card}>
          <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} style={{ color: 'var(--primary-light)' }} /> {t('barcode.print_queue')} ({labels.reduce((s, l) => s + l.qty, 0)} labels)
          </h3>
          {labels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Barcode size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              Add products from the left to queue labels
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {labels.map(l => (
                <div key={l.id} style={{ background: 'var(--surface-base)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', maxWidth: '200px' }}>{l.productName}</div>
                    <button onClick={() => removeFromQueue(l.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', opacity: 0.7, padding: 0 }}>×</button>
                  </div>
                  <LabelCard label={l} compact />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.83rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Copies:</span>
                    <button onClick={() => updateQty(l.id, l.qty - 1)} style={{ width: 24, height: 24, border: '1px solid var(--surface-border)', borderRadius: '5px', cursor: 'pointer', background: 'var(--surface-raised)', fontSize: '0.9rem' }}>−</button>
                    <span style={{ fontWeight: 700, minWidth: '1.5rem', textAlign: 'center' as const }}>{l.qty}</span>
                    <button onClick={() => updateQty(l.id, l.qty + 1)} style={{ width: 24, height: 24, border: '1px solid var(--surface-border)', borderRadius: '5px', cursor: 'pointer', background: 'var(--surface-raised)', fontSize: '0.9rem' }}>+</button>
                  </div>
                </div>
              ))}
              <button onClick={handlePrint} style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--primary-light)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, font: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                <Printer size={18} /> Print All Labels
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden print area */}
      <div ref={printRef} style={{ display: 'none' }} />
    </div>
  );
}
