import { useEffect, useState } from 'react';
<<<<<<< Updated upstream
import { Store } from 'lucide-react';
import { fetchAllRetailers, type RetailerDoc } from '../services/retailerService';

type LoadState = 'loading' | 'ready' | 'error';
=======
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ShopStatus } from '@krishidukan/shared';
import { ChevronRight, Store } from 'lucide-react';

interface Shop {
  id: string;
  businessName: string;
  ownerName: string;
  city: string;
  state: string;
  phone: string;
  status: ShopStatus;
  createdAt: string;
  licenses: { id: string }[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  pending_review: { bg: '#fff7ed', text: '#f57c00', border: '#fed7aa' },
  active: { bg: '#f0fdf4', text: '#154212', border: '#bbf7d0' },
  suspended: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  rejected: { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
};

const FILTERS = ['pending_review', 'active', 'suspended', 'rejected', ''] as const;
const FILTER_LABELS: Record<string, string> = {
  pending_review: 'Pending', active: 'Active', suspended: 'Suspended', rejected: 'Rejected', '': 'All'
};
>>>>>>> Stashed changes

export function ShopsPage() {
  const [retailers, setRetailers] = useState<RetailerDoc[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
<<<<<<< Updated upstream
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
=======
    setLoading(true);
    api.get<{ shops: Shop[]; total: number }>('/admin/shops', { params: { status: filter } })
      .then((r) => { setShops(r.data.shops); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface mb-1">Shops</h1>
          <p className="text-on-surface-variant text-sm">{total} shops total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              filter === f
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-on-surface-variant border-surface-container-highest hover:bg-surface-container-low'
            }`}>
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-on-surface-variant text-sm py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-container overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low">
                {['Business', 'Owner', 'Location', 'Phone', 'Licenses', 'Status', 'Registered', ''].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-black uppercase tracking-widest text-on-surface-variant">{h}</th>
>>>>>>> Stashed changes
                ))}
              </tr>
            </thead>
            <tbody>
<<<<<<< Updated upstream
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
=======
              {shops.map((shop) => {
                const ss = STATUS_STYLES[shop.status] ?? STATUS_STYLES['rejected'];
                return (
                  <tr key={shop.id} onClick={() => navigate(`/shops/${shop.id}`)}
                    className="border-b border-surface-container hover:bg-surface-container-low cursor-pointer transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-on-surface text-sm">{shop.businessName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{shop.ownerName}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{shop.city}, {shop.state}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{shop.phone}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{shop.licenses.length}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full border"
                        style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}>
                        {shop.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">
                      {new Date(shop.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight className="w-4 h-4 text-outline" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shops.length === 0 && (
            <div className="py-16 text-center text-on-surface-variant text-sm">No shops found for this filter.</div>
          )}
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}
