import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Package, Eye, Phone, Navigation } from 'lucide-react';

interface Stats {
  totalViews: number;
  totalCalls: number;
  totalDirections: number;
  viewsLast7Days: number;
  callsLast7Days: number;
  directionsLast7Days: number;
}

export function DashboardPage() {
  const { shop, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!shop) return;
    api.get<Stats>(`/analytics/shop/${shop.id}`)
      .then((r) => setStats(r.data))
      .catch(() => null);
  }, [shop]);

  if (!shop) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#14532d' }}>KrishiDukan</span>
          <span style={{ marginLeft: 12, fontSize: 13, color: '#6b7280' }}>{shop.businessName}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/inventory')} style={{ padding: '7px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Manage Inventory
          </button>
          <button onClick={() => void logout()} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 13, cursor: 'pointer', color: '#6b7280' }}>
            Sign out
          </button>
        </div>
      </header>

      <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>How farmers are finding your shop</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Views', value: stats?.totalViews ?? '—', icon: <Eye size={18} />, sub: `${stats?.viewsLast7Days ?? '—'} this week`, color: '#6366f1' },
            { label: 'Calls Made', value: stats?.totalCalls ?? '—', icon: <Phone size={18} />, sub: `${stats?.callsLast7Days ?? '—'} this week`, color: '#16a34a' },
            { label: 'Directions', value: stats?.totalDirections ?? '—', icon: <Navigation size={18} />, sub: `${stats?.directionsLast7Days ?? '—'} this week`, color: '#f59e0b' },
          ].map((item) => (
            <div key={item.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{item.label}</span>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Package size={18} style={{ color: '#16a34a' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Quick Actions</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/inventory')} style={{ padding: '10px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 14, color: '#14532d', cursor: 'pointer', fontWeight: 500 }}>
              + Add Products
            </button>
            <button onClick={() => navigate('/licenses')} style={{ padding: '10px 20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 14, color: '#1d4ed8', cursor: 'pointer', fontWeight: 500 }}>
              Upload Licenses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
