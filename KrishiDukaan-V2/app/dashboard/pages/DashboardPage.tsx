'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { IS_DEMO } from '../demoMode';
import { AppShell } from '../components/layout/AppShell';
import { StatCard } from '../components/widgets/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Eye, Phone, Navigation, Package, AlertTriangle, TrendingUp, Plus, Upload, Users, Star, ArrowRight, ShoppingBag } from 'lucide-react';
import { getInventoryByRetailer } from '../services/inventoryService';
import { formatCompact } from '../utils/formatters';

interface Stats { totalViews: number; totalCalls: number; totalDirections: number; viewsLast7Days: number; callsLast7Days: number; directionsLast7Days: number; }

export function DashboardPage() {
  const { shop, userDoc } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [invCount, setInvCount] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [oos, setOos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop) return;
    api.get<Stats>(`/analytics/shop/${shop.id}`).then((r) => setStats(r.data)).catch(() => null).finally(() => setLoading(false));
    if (!IS_DEMO) {
      const rid = userDoc?.retailerId ?? shop.id;
      getInventoryByRetailer(rid).then((items) => {
        setInvCount(items.length);
        setLowStock(items.filter((i) => i.stock > 0 && i.stock <= 5).length);
        setOos(items.filter((i) => i.stock === 0).length);
      }).catch(() => null);
    }
  }, [shop, userDoc]);

  if (!shop) return null;

  return (
    <AppShell title="Dashboard" subtitle="Overview of your shop performance">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {loading ? (<><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>) : (<>
          <StatCard label="Total Views" value={formatCompact(stats?.totalViews ?? 0)} subtitle={`${stats?.viewsLast7Days ?? 0} this week`} icon={<Eye size={18} />} trend={{ value: '+12%', positive: true }} color="var(--kd-indigo-500)" />
          <StatCard label="Calls Received" value={formatCompact(stats?.totalCalls ?? 0)} subtitle={`${stats?.callsLast7Days ?? 0} this week`} icon={<Phone size={18} />} trend={{ value: '+8%', positive: true }} color="var(--kd-primary)" />
          <StatCard label="Directions" value={formatCompact(stats?.totalDirections ?? 0)} subtitle={`${stats?.directionsLast7Days ?? 0} this week`} icon={<Navigation size={18} />} color="var(--kd-amber-500)" />
          <StatCard label="Products Listed" value={invCount || '—'} subtitle={lowStock > 0 ? `${lowStock} low stock` : 'All healthy'} icon={<Package size={18} />} color="var(--kd-cyan-500)" />
        </>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Inventory Health */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><ShoppingBag size={18} style={{ color: 'var(--kd-primary)' }} /><span style={{ fontSize: 15, fontWeight: 600 }}>Inventory Health</span></div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/inventory')}>View All <ArrowRight size={14} /></Button>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { val: invCount, label: 'Total Listed', bg: 'var(--kd-primary-light)', color: 'var(--kd-green-700)' },
              { val: lowStock, label: 'Low Stock', bg: lowStock > 0 ? 'var(--kd-warning-light)' : 'var(--kd-gray-50)', color: lowStock > 0 ? 'var(--kd-amber-600)' : 'var(--kd-text-muted)' },
              { val: oos, label: 'Out of Stock', bg: oos > 0 ? 'var(--kd-danger-light)' : 'var(--kd-gray-50)', color: oos > 0 ? 'var(--kd-danger)' : 'var(--kd-text-muted)' },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, padding: 16, borderRadius: 8, background: s.bg, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>
          {(lowStock > 0 || oos > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--kd-warning-light)', border: '1px solid #fde68a' }}>
              <AlertTriangle size={14} style={{ color: 'var(--kd-amber-600)' }} />
              <span style={{ fontSize: 12, color: 'var(--kd-amber-600)' }}>{oos > 0 ? `${oos} out of stock. ` : ''}{lowStock > 0 ? `${lowStock} running low.` : ''}</span>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}><TrendingUp size={18} style={{ color: 'var(--kd-primary)' }} /><span style={{ fontSize: 15, fontWeight: 600 }}>Quick Actions</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Add Products', icon: <Plus size={16} />, path: '/inventory', bg: 'var(--kd-green-50)', border: 'var(--kd-green-200)', fg: 'var(--kd-green-700)' },
              { label: 'Upload License', icon: <Upload size={16} />, path: '/profile', bg: '#eff6ff', border: '#bfdbfe', fg: 'var(--kd-blue-600)' },
              { label: 'View Analytics', icon: <TrendingUp size={16} />, path: '/analytics', bg: '#faf5ff', border: '#d8b4fe', fg: 'var(--kd-purple-500)' },
              { label: 'Shop Profile', icon: <Users size={16} />, path: '/profile', bg: '#fffbeb', border: '#fde68a', fg: 'var(--kd-amber-600)' },
            ].map((a) => (
              <button key={a.label} onClick={() => router.push(`/dashboard${a.path}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: a.bg, border: `1px solid ${a.border}`, borderRadius: 8, color: a.fg, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--kd-font)', transition: 'transform 120ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}>
                {a.icon}{a.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Reviews & Ratings</span>
          <Badge variant="neutral"><Star size={12} /> No reviews yet</Badge>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Star size={28} style={{ color: 'var(--kd-gray-200)', marginBottom: 8 }} />
          <div style={{ color: 'var(--kd-text-muted)', fontSize: 13 }}>Reviews from farmers will appear here</div>
        </div>
      </Card>
    </AppShell>
  );
}
