import { useEffect, useState } from 'react';
import { api } from '../api';
import { Store, Users, Search, Clock } from 'lucide-react';

interface Summary {
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  suspendedShops: number;
  totalFarmers: number;
  totalSearches: number;
  searchesLast7Days: number;
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>{value.toLocaleString()}</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Summary>('/admin/analytics/summary')
      .then((r) => setSummary(r.data))
      .catch(() => setError('Failed to load summary'));
  }, []);

  if (error) return <div style={{ color: '#f87171', padding: 32 }}>{error}</div>;
  if (!summary) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14 }}>Platform overview</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard label="Active Shops" value={summary.activeShops} icon={<Store size={20} />} color="#22c55e" />
        <StatCard label="Pending Review" value={summary.pendingShops} icon={<Clock size={20} />} color="#f59e0b" />
        <StatCard label="Total Farmers" value={summary.totalFarmers} icon={<Users size={20} />} color="#60a5fa" />
        <StatCard label="Searches (7 days)" value={summary.searchesLast7Days} icon={<Search size={20} />} color="#a78bfa" />
        <StatCard label="Total Shops" value={summary.totalShops} icon={<Store size={20} />} color="#94a3b8" />
        <StatCard label="Total Searches" value={summary.totalSearches} icon={<Search size={20} />} color="#94a3b8" />
      </div>
    </div>
  );
}
