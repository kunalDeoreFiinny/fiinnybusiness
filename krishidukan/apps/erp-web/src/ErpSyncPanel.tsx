import { useState } from 'react';
import { kdApi } from './api';
import { ERP_API_KEY_HEADER } from '@krishidukan/shared';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ErpSyncPanelProps {
  shopId: string;
  erpShopRef: string;
  erpApiKey: string;
}

interface SyncResult {
  synced: number;
  failed: number;
  shopErpRef?: string;
}

interface ErpBillItem {
  productId: string;
  quantity: number;
  price: number;
  mrp: number;
}

export function ErpSyncPanel({ shopId, erpShopRef, erpApiKey }: ErpSyncPanelProps) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  /**
   * Called by the ERP billing module after each sale is completed.
   * Pass the full current inventory state (not just the billed items) for accuracy.
   */
  async function syncInventory(items: ErpBillItem[]) {
    setSyncing(true);
    setError('');
    try {
      const res = await kdApi.post<SyncResult>(
        `/inventory/erp-sync/${shopId}`,
        { items, shopErpRef: erpShopRef },
        { headers: { [ERP_API_KEY_HEADER]: erpApiKey } },
      );
      setResult(res.data);
      setLastSync(new Date());
    } catch (e) {
      setError('Sync failed. Check your network and try again.');
    } finally {
      setSyncing(false);
    }
  }

  // Demo sync with empty items — in real integration, pass actual stock snapshot
  async function demoSync() {
    await syncInventory([]);
  }

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <h3 style={styles.panelTitle}>Inventory Sync</h3>
          <p style={styles.panelSub}>
            Marketplace stock updates automatically after each ERP billing.
            {lastSync && ` Last sync: ${lastSync.toLocaleTimeString('en-IN')}`}
          </p>
        </div>
        <button
          onClick={() => void demoSync()}
          disabled={syncing}
          style={{ ...styles.syncBtn, opacity: syncing ? 0.6 : 1 }}
        >
          <RefreshCw size={14} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          {syncing ? 'Syncing...' : 'Manual Sync'}
        </button>
      </div>

      {result && (
        <div style={{ ...styles.resultBox, ...(result.failed > 0 ? styles.resultWarn : styles.resultOk) }}>
          {result.failed === 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{result.synced} items synced{result.failed > 0 ? `, ${result.failed} failed` : ' successfully'}</span>
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Integration method</div>
          <div style={styles.infoValue}>Automatic — triggers after each bill</div>
        </div>
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Sync direction</div>
          <div style={styles.infoValue}>ERP → KrishiDukan (one-way)</div>
        </div>
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>ERP Ref</div>
          <div style={styles.infoValue}>{erpShopRef}</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  panelTitle: { fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, marginBottom: 4 },
  panelSub: { fontSize: 12, color: '#6b7280', margin: 0 },
  syncBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  resultBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 7, fontSize: 13, marginBottom: 14 },
  resultOk: { background: '#dcfce7', color: '#14532d' },
  resultWarn: { background: '#fef3c7', color: '#92400e' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fef2f2', color: '#dc2626', borderRadius: 7, fontSize: 13, marginBottom: 14 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  infoItem: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 7, padding: '10px 14px' },
  infoLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  infoValue: { fontSize: 13, color: '#374151', fontWeight: 500 },
};
