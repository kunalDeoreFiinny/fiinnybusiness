import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ShopStatus } from '@krishidukan/shared';

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

const STATUS_COLORS: Record<string, string> = {
  pending_review: '#f59e0b',
  active: '#22c55e',
  suspended: '#f87171',
  rejected: '#94a3b8',
};

export function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>('pending_review');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get<{ shops: Shop[]; total: number }>('/admin/shops', { params: { status: filter } })
      .then((r) => { setShops(r.data.shops); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [filter]);

  const FILTERS = ['pending_review', 'active', 'suspended', 'rejected', ''];

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
        Shops ({total})
      </h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid',
              fontSize: 13, cursor: 'pointer',
              borderColor: filter === f ? '#22c55e' : '#334155',
              background: filter === f ? 'rgba(34,197,94,0.1)' : 'transparent',
              color: filter === f ? '#22c55e' : '#94a3b8',
            }}
          >
            {f || 'All'}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ color: '#64748b' }}>Loading...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155' }}>
              {['Business', 'Owner', 'Location', 'Phone', 'Licenses', 'Status', 'Registered'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr
                key={shop.id}
                onClick={() => navigate(`/shops/${shop.id}`)}
                style={{ borderBottom: '1px solid #1e293b', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px', fontSize: 14, color: '#f1f5f9', fontWeight: 500 }}>{shop.businessName}</td>
                <td style={{ padding: '12px', fontSize: 13, color: '#94a3b8' }}>{shop.ownerName}</td>
                <td style={{ padding: '12px', fontSize: 13, color: '#94a3b8' }}>{shop.city}, {shop.state}</td>
                <td style={{ padding: '12px', fontSize: 13, color: '#94a3b8' }}>{shop.phone}</td>
                <td style={{ padding: '12px', fontSize: 13, color: '#94a3b8' }}>{shop.licenses.length}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: `${STATUS_COLORS[shop.status]}20`, color: STATUS_COLORS[shop.status] }}>
                    {shop.status}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: 12, color: '#475569' }}>
                  {new Date(shop.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
