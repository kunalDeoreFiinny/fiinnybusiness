import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';

const KD_API_BASE = import.meta.env['VITE_KD_API_BASE_URL'] ?? 'http://localhost:3001';
const kdApi = axios.create({ baseURL: `${KD_API_BASE}/api/v1` });

type ShopStatus = 'pending_review' | 'active' | 'suspended' | 'rejected';

interface ShopInfo {
  id: string;
  businessName: string;
  status: ShopStatus;
}

interface InventoryItem {
  productId: string;
  price: number;
  mrp: number;
  quantity: number;
}

function SyncPanel({ shopId, erpShopRef, erpApiKey }: { shopId: string; erpShopRef: string; erpApiKey: string }) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [result, setResult] = useState<{ upserted: number; failed: number } | null>(null);

  async function syncInventory(items: InventoryItem[]) {
    setSyncing(true);
    setResult(null);
    try {
      const res = await axios.post(
        `${KD_API_BASE}/api/v1/inventory/erp-sync/${shopId}`,
        { erpShopRef, items },
        { headers: { 'X-ERP-API-Key': erpApiKey } },
      );
      setResult(res.data);
      setLastSync(new Date());
    } catch {
      setResult({ upserted: 0, failed: items.length });
    } finally {
      setSyncing(false);
    }
  }

  // Expose sync function for external callers (e.g., POS billing completion)
  const syncRef = useRef(syncInventory);
  syncRef.current = syncInventory;
  useEffect(() => {
    (window as any).__kdSyncInventory = (items: InventoryItem[]) => syncRef.current(items);
    return () => { delete (window as any).__kdSyncInventory; };
  }, []);

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: '#15803d', fontWeight: 600, margin: 0 }}>
          ERP Inventory Sync
        </p>
        {lastSync && (
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            Last sync: {lastSync.toLocaleTimeString()}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>
        Inventory is synced automatically after each billing. You can also trigger a manual sync below.
      </p>
      <button
        disabled={syncing}
        onClick={() => void syncInventory([])}
        style={{
          padding: '8px 18px', background: syncing ? '#d1d5db' : '#16a34a',
          color: '#fff', border: 'none', borderRadius: 8, fontSize: 13,
          fontWeight: 600, cursor: syncing ? 'not-allowed' : 'pointer',
        }}
      >
        {syncing ? 'Syncing…' : 'Manual Sync'}
      </button>
      {result && (
        <p style={{ marginTop: 12, fontSize: 12, color: result.failed > 0 ? '#dc2626' : '#16a34a' }}>
          {result.failed > 0
            ? `Sync partial: ${result.upserted} updated, ${result.failed} failed`
            : `Sync complete: ${result.upserted} items updated`}
        </p>
      )}
    </div>
  );
}

function ApiKeySetup({ tenantId, onSaved }: { tenantId: string; onSaved: (key: string) => void }) {
  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!key.trim()) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'tenants', tenantId, 'settings', 'krishidukan'),
        { erpApiKey: key.trim() },
        { merge: true },
      );
      onSaved(key.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '20px 24px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: '0 0 8px' }}>
        ERP API Key Required
      </p>
      <p style={{ fontSize: 13, color: '#78350f', margin: '0 0 16px' }}>
        Enter the ERP API key you received when your KrishiDukan shop was approved.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Paste your ERP API key"
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }}
        />
        <button
          disabled={saving || !key.trim()}
          onClick={save}
          style={{ padding: '8px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function KrishiDukanPage() {
  const { currentUser, tenantId } = useAuth();
  const [kdToken, setKdToken] = useState<string | null>(null);
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [erpApiKey, setErpApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || !tenantId) return;
    void init();
  }, [currentUser, tenantId]);

  async function init() {
    setLoading(true);
    setError('');
    try {
      // Get KD JWT
      const idToken = await currentUser!.getIdToken();
      const authRes = await kdApi.post<{ accessToken: string }>('/auth/login', { idToken });
      const token = authRes.data.accessToken;
      setKdToken(token);
      kdApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch shop
      const shopRes = await kdApi.get<ShopInfo>('/shops/me');
      setShop(shopRes.data);

      // Load stored ERP API key from Firestore
      const settingsSnap = await getDoc(doc(db, 'tenants', tenantId!, 'settings', 'krishidukan'));
      if (settingsSnap.exists()) {
        setErpApiKey(settingsSnap.data().erpApiKey ?? null);
      }
    } catch {
      setError('KrishiDukan account not connected. Register at the shop portal first.');
    } finally {
      setLoading(false);
    }
  }

  if (!tenantId) return null;

  if (loading) {
    return (
      <div style={{ padding: 32, color: '#6b7280', fontSize: 14 }}>
        Connecting to KrishiDukan…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 560 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '16px 20px', color: '#dc2626', fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
        <a
          href={import.meta.env['VITE_KD_SHOP_PORTAL_URL'] ?? 'http://localhost:5174'}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-block', padding: '10px 20px', background: '#16a34a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
        >
          Register on KrishiDukan →
        </a>
      </div>
    );
  }

  if (!shop) return null;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 680, fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0, marginBottom: 4 }}>
            🌾 KrishiDukan Marketplace
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{shop.businessName}</p>
        </div>
        <span style={{
          padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: shop.status === 'active' ? '#dcfce7' : shop.status === 'suspended' ? '#fee2e2' : '#fef3c7',
          color: shop.status === 'active' ? '#14532d' : shop.status === 'suspended' ? '#991b1b' : '#92400e',
        }}>
          {shop.status === 'active' ? '● Live on marketplace' : shop.status.replace('_', ' ')}
        </span>
      </div>

      {shop.status === 'active' ? (
        erpApiKey ? (
          <SyncPanel shopId={shop.id} erpShopRef={tenantId!} erpApiKey={erpApiKey} />
        ) : (
          <ApiKeySetup tenantId={tenantId!} onSaved={setErpApiKey} />
        )
      ) : shop.status === 'rejected' ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '16px 20px', fontSize: 14, color: '#991b1b' }}>
          Your shop registration was rejected. Contact KrishiDukan support to reapply.
        </div>
      ) : (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '16px 20px', fontSize: 14, color: '#92400e' }}>
          Your shop is pending admin approval. Once approved, ERP billing will automatically sync inventory to the marketplace.
        </div>
      )}

      {/* Info strip */}
      <div style={{ marginTop: 24, padding: '14px 18px', background: 'var(--surface-raised, #f9fafb)', border: '1px solid var(--surface-border, #e5e7eb)', borderRadius: 8 }}>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
          <strong>How it works:</strong> After each POS billing, product inventory is automatically pushed to the KrishiDukan marketplace so nearby farmers can find what's in stock at your shop in real time.
        </p>
      </div>
    </div>
  );
}
