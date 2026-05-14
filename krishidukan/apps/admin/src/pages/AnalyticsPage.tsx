import { useEffect, useState } from 'react';
import { api } from '../api';
import { TrendingUp, Search } from 'lucide-react';

interface Summary {
  totalShops: number;
  activeShops: number;
  totalSearches: number;
  searchesLast7Days: number;
  totalFarmers: number;
  topProducts?: { name: string; searches: number }[];
}

export function AnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    api.get<Summary>('/admin/analytics/summary').then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="p-8 text-on-surface-variant text-sm">Loading analytics...</div>;

  const max = Math.max(...(data.topProducts ?? []).map((p) => p.searches), 1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-1">Analytics</h1>
        <p className="text-on-surface-variant text-sm">Search trends and platform health</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Search, label: 'Total Searches', value: data.totalSearches, color: '#154212' },
          { icon: TrendingUp, label: 'Last 7 days', value: data.searchesLast7Days, color: '#705a4c' },
          { icon: Search, label: 'Avg Daily', value: Math.round(data.searchesLast7Days / 7), color: '#72796e' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-surface-container p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-on-surface-variant">
              <Icon size={15} style={{ color }} />
              <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-3xl font-extrabold text-on-surface tracking-tight">{value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-surface-container p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Most Searched Products</h2>
        </div>
        <div className="flex flex-col gap-5">
          {(data.topProducts ?? []).map((p, i) => (
            <div key={p.name}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-on-surface font-medium">
                  <span className="text-on-surface-variant mr-2 text-xs font-bold">#{i + 1}</span>{p.name}
                </span>
                <span className="text-sm font-black text-primary">{p.searches.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${(p.searches / max) * 100}%` }} />
              </div>
            </div>
          ))}
          {(data.topProducts ?? []).length === 0 && (
            <p className="text-sm text-on-surface-variant">No search data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
