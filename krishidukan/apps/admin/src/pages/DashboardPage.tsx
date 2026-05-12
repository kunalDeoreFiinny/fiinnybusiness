import { useEffect, useState } from 'react';
import { api } from '../api';
import { Store, Users, Search, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface Summary {
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  suspendedShops: number;
  totalFarmers: number;
  totalSearches: number;
  searchesLast7Days: number;
}

function StatCard({ label, value, icon, color, bgColor }: { label: string; value: number; icon: React.ReactNode; color: string; bgColor: string }) {
  return (
    <div className="bg-white border border-surface-container rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-ambient transition-shadow">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bgColor, color }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold text-on-surface tracking-tight">{value.toLocaleString()}</div>
        <div className="text-sm text-on-surface-variant font-medium">{label}</div>
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

  if (error) return (
    <div className="p-8 flex items-center gap-3 text-red-600">
      <AlertCircle className="w-5 h-5" /> {error}
    </div>
  );
  if (!summary) return <div className="p-8 text-on-surface-variant text-sm">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Dashboard</h1>
        <p className="text-on-surface-variant text-sm">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Shops" value={summary.activeShops} icon={<Store size={20} />} color="#154212" bgColor="rgba(21,66,18,0.08)" />
        <StatCard label="Pending Review" value={summary.pendingShops} icon={<Clock size={20} />} color="#f57c00" bgColor="rgba(245,124,0,0.08)" />
        <StatCard label="Total Farmers" value={summary.totalFarmers} icon={<Users size={20} />} color="#705a4c" bgColor="rgba(112,90,76,0.08)" />
        <StatCard label="Searches (7d)" value={summary.searchesLast7Days} icon={<TrendingUp size={20} />} color="#154212" bgColor="rgba(21,66,18,0.08)" />
        <StatCard label="Total Shops" value={summary.totalShops} icon={<Store size={20} />} color="#72796e" bgColor="rgba(114,121,110,0.08)" />
        <StatCard label="Total Searches" value={summary.totalSearches} icon={<Search size={20} />} color="#72796e" bgColor="rgba(114,121,110,0.08)" />
      </div>

      {summary.pendingShops > 0 && (
        <div className="bg-harvest/10 border border-harvest/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-harvest/20 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-harvest" />
          </div>
          <div>
            <div className="font-bold text-on-surface">{summary.pendingShops} shops awaiting review</div>
            <div className="text-sm text-on-surface-variant">Review and approve or reject pending shop applications</div>
          </div>
          <a href="/shops" className="ml-auto bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold no-underline hover:bg-primary-container transition-colors">Review Now</a>
        </div>
      )}
    </div>
  );
}
