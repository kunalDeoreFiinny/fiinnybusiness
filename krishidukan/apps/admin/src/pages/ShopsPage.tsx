import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { fetchAllRetailers, type RetailerDoc } from '../services/retailerService';

type LoadState = 'loading' | 'ready' | 'error';

export function ShopsPage() {
  const [retailers, setRetailers] = useState<RetailerDoc[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAllRetailers()
      .then((data) => { setRetailers(data); setState('ready'); })
      .catch((err: unknown) => {
        console.error('[ShopsPage] Failed to fetch retailers:', err);
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load retailers');
        setState('error');
      });
  }, []);

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Store size={20} color="#22c55e" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
            Retailers {state === 'ready' && <span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}>({retailers.length})</span>}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>All registered retailer accounts from Firestore</p>
        </div>
      </div>

      {/* Loading */}
      {state === 'loading' && (
        <div style={{ color: '#64748b', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          Loading retailers…
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '14px 18px', color: '#fca5a5', fontSize: 14 }}>
          {errorMsg}
        </div>
      )}

      {/* Empty state */}
      {state === 'ready' && retailers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
          <Store size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>No retailers yet</p>
          <p style={{ fontSize: 13 }}>Add a retailer using the "Add Retailer" page.</p>
        </div>
      )}

      {/* Table */}
      {state === 'ready' && retailers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Shop Name', 'Owner Name', 'Phone', 'Address', 'Lat', 'Lng', 'Created At'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retailers.map((r) => (
                <tr
                  key={r.uid}
                  style={{ borderBottom: '1px solid #1e293b' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '13px 14px', color: '#f1f5f9', fontWeight: 600 }}>{r.shopName}</td>
                  <td style={{ padding: '13px 14px', color: '#94a3b8' }}>{r.ownerName}</td>
                  <td style={{ padding: '13px 14px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{r.phone}</td>
                  <td style={{ padding: '13px 14px', color: '#94a3b8', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address}</td>
                  <td style={{ padding: '13px 14px', color: '#64748b', fontFamily: 'monospace' }}>{r.location.lat.toFixed(4)}</td>
                  <td style={{ padding: '13px 14px', color: '#64748b', fontFamily: 'monospace' }}>{r.location.lng.toFixed(4)}</td>
                  <td style={{ padding: '13px 14px', color: '#475569', whiteSpace: 'nowrap' }}>
                    {r.createdAt ? r.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
