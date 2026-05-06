import { useEffect, useState } from 'react';
import { api } from '../api';
import { TrendingUp } from 'lucide-react';

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

  if (!data) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;

  const max = Math.max(...(data.topProducts ?? []).map((p) => p.searches), 1);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Analytics</h1>
      <p style={{ color: '#64748b', marginBottom: 28, fontSize: 14 }}>Search trends and platform health</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          ['Total Searches', data.totalSearches.toLocaleString()],
          ['Last 7 days', data.searchesLast7Days.toLocaleString()],
          ['Avg Daily', Math.round(data.searchesLast7Days / 7).toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <TrendingUp size={16} color="#22c55e" />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Most Searched Products
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(data.topProducts ?? []).map((p, i) => (
            <div key={p.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#e2e8f0' }}>
                  <span style={{ color: '#64748b', marginRight: 8 }}>#{i + 1}</span>
                  {p.name}
                </span>
                <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
                  {p.searches.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 6, background: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${(p.searches / max) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
