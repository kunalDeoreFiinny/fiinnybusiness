import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/widgets/StatCard';
import { Badge } from '../components/ui/Badge';
import { IS_DEMO, DEMO_SHOP_STATS } from '../demoMode';
import { Eye, Phone, Navigation, Search, TrendingUp, BarChart2, Calendar } from 'lucide-react';
import { getAnalytics, aggregateAnalytics, calculateTrend } from '../services/analyticsService';
import { formatCompact } from '../utils/formatters';
import type { AnalyticsDoc } from '../types/firebase';

export function AnalyticsPage() {
  const { shop, userDoc } = useAuth();
  const [data, setData] = useState<AnalyticsDoc[]>([]);
  const [period, setPeriod] = useState<7 | 14 | 30>(30);
  const [, setLoading] = useState(true);
  const retailerId = userDoc?.retailerId ?? shop?.id ?? '';

  useEffect(() => {
    if (IS_DEMO) {
      setLoading(false);
      return;
    }
    if (!retailerId) return;
    setLoading(true);
    getAnalytics(retailerId, period).then(setData).catch(() => null).finally(() => setLoading(false));
  }, [retailerId, period]);

  const totals = IS_DEMO
    ? { totalViews: DEMO_SHOP_STATS.totalViews, totalCalls: DEMO_SHOP_STATS.totalCalls, totalDirections: DEMO_SHOP_STATS.totalDirections, totalSearches: 340, totalInquiries: 56 }
    : aggregateAnalytics(data);

  const viewsTrend = data.length >= 14 ? calculateTrend(data, 'views') : { value: '—', positive: true };
  const callsTrend = data.length >= 14 ? calculateTrend(data, 'calls') : { value: '—', positive: true };

  return (
    <AppShell title="Analytics" subtitle="Track how farmers discover your shop">
      {/* Period Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([7, 14, 30] as const).map((d) => (
          <button key={d} onClick={() => setPeriod(d)} style={{
            padding: '7px 18px', borderRadius: 20, border: period === d ? '1px solid var(--kd-primary)' : '1px solid var(--kd-border)',
            background: period === d ? 'var(--kd-primary-light)' : 'var(--kd-surface)', color: period === d ? 'var(--kd-green-700)' : 'var(--kd-text-secondary)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--kd-font)',
          }}>
            <Calendar size={12} style={{ marginRight: 6, verticalAlign: -1 }} />{d} Days
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Views" value={formatCompact(totals.totalViews)} icon={<Eye size={18} />} trend={viewsTrend} color="var(--kd-indigo-500)" />
        <StatCard label="Calls Made" value={formatCompact(totals.totalCalls)} icon={<Phone size={18} />} trend={callsTrend} color="var(--kd-primary)" />
        <StatCard label="Directions" value={formatCompact(totals.totalDirections)} icon={<Navigation size={18} />} color="var(--kd-amber-500)" />
        <StatCard label="Search Appearances" value={formatCompact(totals.totalSearches)} icon={<Search size={18} />} color="var(--kd-cyan-500)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Chart placeholder */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <BarChart2 size={18} style={{ color: 'var(--kd-primary)' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Views Over Time</span>
          </div>
          {data.length === 0 ? (
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--kd-text-muted)' }}>
              <BarChart2 size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <div style={{ fontSize: 13 }}>Analytics data will appear as farmers interact</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, padding: '0 8px' }}>
              {data.slice(-period).map((d, i) => {
                const maxViews = Math.max(...data.map((x) => x.views), 1);
                const h = Math.max((d.views / maxViews) * 160, 4);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', height: h, background: 'linear-gradient(180deg, var(--kd-green-400), var(--kd-green-600))', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease', minWidth: 6 }} title={`${d.date}: ${d.views} views`} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Insights */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <TrendingUp size={18} style={{ color: 'var(--kd-primary)' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Insights</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Peak inquiry time', value: '10 AM - 12 PM', icon: '🕐', variant: 'info' as const },
              { label: 'Most viewed category', value: 'Seeds & Fertilizers', icon: '🌱', variant: 'success' as const },
              { label: 'Response rate', value: '94%', icon: '📞', variant: 'success' as const },
              { label: 'Avg. farmer distance', value: '8.2 km', icon: '📍', variant: 'neutral' as const },
            ].map((insight) => (
              <div key={insight.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, background: 'var(--kd-gray-50)' }}>
                <span style={{ fontSize: 20 }}>{insight.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{insight.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--kd-text-muted)' }}>{insight.label}</div>
                </div>
                <Badge variant={insight.variant}>{insight.variant === 'success' ? 'Good' : insight.variant === 'info' ? 'Peak' : 'Avg'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
