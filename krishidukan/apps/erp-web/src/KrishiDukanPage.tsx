import { useState, useEffect } from 'react';
import { kdApi, setKdToken } from './api';
import { ErpSyncPanel } from './ErpSyncPanel';
import { ShopStatus } from '@krishidukan/shared';

interface KrishiDukanPageProps {
  /** Firebase ID token from the ERP's existing auth context */
  firebaseIdToken: string;
  /** ERP internal shop/tenant identifier — used as shopErpRef in sync calls */
  erpShopRef: string;
  /** Per-shop ERP API key (obtained from admin when shop was approved) */
  erpApiKey: string;
}

interface ShopInfo {
  id: string;
  businessName: string;
  status: ShopStatus;
}

export function KrishiDukanPage({ firebaseIdToken, erpShopRef, erpApiKey }: KrishiDukanPageProps) {
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void init();
  }, [firebaseIdToken]);

  async function init() {
    try {
      const res = await kdApi.post<{ accessToken: string }>('/auth/login', { idToken: firebaseIdToken });
      setKdToken(res.data.accessToken);
      const shopRes = await kdApi.get<ShopInfo>('/shops/me');
      setShop(shopRes.data);
    } catch {
      setError('KrishiDukan account not connected. Register at the shop portal first.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={styles.loading}>Connecting to KrishiDukan...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!shop) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>KrishiDukan Marketplace</h2>
          <p style={styles.subtitle}>{shop.businessName}</p>
        </div>
        <span style={{ ...styles.badge, ...(shop.status === 'active' ? styles.badgeActive : styles.badgePending) }}>
          {shop.status === 'active' ? 'Live on marketplace' : shop.status}
        </span>
      </div>

      {shop.status === 'active' ? (
        <ErpSyncPanel shopId={shop.id} erpShopRef={erpShopRef} erpApiKey={erpApiKey} />
      ) : (
        <div style={styles.infoBox}>
          <p style={{ fontSize: 14, color: '#92400e' }}>
            Your shop is pending admin approval. Once approved, ERP billing will automatically sync to the marketplace.
          </p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', fontFamily: 'inherit' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 700, color: '#14532d', margin: 0, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', margin: 0 },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeActive: { background: '#dcfce7', color: '#14532d' },
  badgePending: { background: '#fef3c7', color: '#92400e' },
  loading: { padding: 32, color: '#6b7280', fontSize: 14 },
  error: { padding: 24, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 14 },
  infoBox: { background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '16px 20px' },
};
