import { useState, useEffect } from 'react';
import { query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { ShoppingCart, Truck, Clock, IndianRupee, Activity, Package, Globe, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import type { OnlineOrder } from './OnlineOrdersPage';

const fmtINR = (n: number) => {
    if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
    if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2).replace(/\.?0+$/, '')}L`;
    if (n >= 1_000)       return `₹${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

interface DailyBucket { date: string; revenue: number; orders: number; }

export function OnlineDashboardPage() {
    const [orders, setOrders] = useState<OnlineOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartMode, setChartMode] = useState<'7d' | '30d'>('30d');
    const { tenantId } = useAuth();

    useEffect(() => {
        if (!tenantId) return;
        const q = query(getTenantCollection(db, tenantId, 'onlineOrders'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })) as OnlineOrder[]);
            setLoading(false);
        });
        return () => unsub();
    }, [tenantId]);

    // ── Compute all KPIs ──
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalRevenue = 0, todayRevenue = 0, monthRevenue = 0;
    let todayCount = 0, monthCount = 0;
    let dispatched = 0, pendingDispatch = 0;
    let prepaidRev = 0, codRev = 0;
    let paidCount = 0, unpaidCount = 0;
    let websiteCount = 0, phoneCount = 0;
    const dailyMap = new Map<string, DailyBucket>();

    orders.forEach(o => {
        const amt = Number(o.amount) || 0;
        totalRevenue += amt;

        const ts: Date = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
        const dateStr = ts.toISOString().split('T')[0];

        if (dateStr === todayStr) { todayRevenue += amt; todayCount++; }
        if (ts >= startOfMonth) { monthRevenue += amt; monthCount++; }

        if (o.courierSent === 'Yes') dispatched++; else pendingDispatch++;
        if (o.paymentMethod === 'Prepaid') prepaidRev += amt; else codRev += amt;
        if (o.paymentStatus === 'Paid') paidCount++; else unpaidCount++;
        if (o.source === 'Website') websiteCount++; else phoneCount++;

        if (!dailyMap.has(dateStr)) dailyMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
        const b = dailyMap.get(dateStr)!;
        b.revenue += amt;
        b.orders++;
    });

    const fulfillRate = orders.length > 0 ? Math.round(dispatched * 100 / orders.length) : 0;
    const allChartData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    const visibleChart = chartMode === '7d' ? allChartData.slice(-7) : allChartData;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1rem', color: 'var(--text-secondary)' }}>
                <Activity className="animate-spin" size={28} style={{ color: 'var(--primary-light)' }} />
                Loading online orders...
            </div>
        );
    }

    const KpiCard = ({ label, value, sub, icon: Icon, border, bg }: { label: string; value: string; sub?: string; icon: any; border: string; bg: string }) => (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: `4px solid ${border}`, background: bg, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</p>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1rem, 2.2vw, 1.45rem)', fontWeight: 800, color: border, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</h2>
                    {sub && <p style={{ margin: '0.2rem 0 0', color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>{sub}</p>}
                </div>
                <div style={{ background: `${border}22`, borderRadius: '12px', padding: '0.65rem', flexShrink: 0 }}>
                    <Icon size={20} color={border} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Globe size={30} /> Online Orders Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>D2C fulfilment, revenue and dispatch performance.</p>
                </div>
                <Link to="/online-orders" className="btn btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShoppingCart size={18} /> Manage Orders
                </Link>
            </div>

            {/* KPI Strip — 6 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <KpiCard label="Today's Revenue" value={fmtINR(todayRevenue)} sub={`${todayCount} orders today`} icon={IndianRupee} border="#10b981" bg="rgba(16,185,129,0.07)" />
                <KpiCard label="This Month" value={fmtINR(monthRevenue)} sub={`${monthCount} orders`} icon={Calendar} border="#818cf8" bg="rgba(99,102,241,0.07)" />
                <KpiCard label="Gross Revenue" value={fmtINR(totalRevenue)} sub={`${orders.length} total orders`} icon={TrendingUpIcon} border="#38bdf8" bg="rgba(14,165,233,0.07)" />
                <KpiCard label="Dispatched" value={String(dispatched)} sub={`${fulfillRate}% fulfillment rate`} icon={Truck} border="#34d399" bg="rgba(52,211,153,0.07)" />
                <KpiCard label="Pending Dispatch" value={String(pendingDispatch)} sub="awaiting courier" icon={Clock} border="#f59e0b" bg="rgba(245,158,11,0.07)" />
                <KpiCard label="Prepaid Orders" value={fmtINR(prepaidRev)} sub={`COD: ${fmtINR(codRev)}`} icon={CreditCard} border="#a78bfa" bg="rgba(167,139,250,0.07)" />
            </div>

            {/* Fulfillment Rate Bar */}
            {orders.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CheckCircle2 size={16} color="#10b981" /> Fulfillment Rate
                        </p>
                        <span style={{ fontWeight: 800, color: fulfillRate >= 70 ? '#10b981' : fulfillRate >= 40 ? '#f59e0b' : '#f87171', fontSize: '1rem' }}>{fulfillRate}%</span>
                    </div>
                    <div style={{ height: '10px', borderRadius: '99px', background: 'var(--surface-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${fulfillRate}%`, height: '100%', borderRadius: '99px', background: fulfillRate >= 70 ? 'linear-gradient(90deg,#10b981,#34d399)' : fulfillRate >= 40 ? 'linear-gradient(90deg,#f59e0b,#fcd34d)' : 'linear-gradient(90deg,#ef4444,#f87171)', transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                        <span>✅ Dispatched: <strong>{dispatched}</strong></span>
                        <span>⏳ Pending: <strong>{pendingDispatch}</strong></span>
                        <span>💰 Paid: <strong>{paidCount}</strong></span>
                        <span>🔴 Unpaid: <strong>{unpaidCount}</strong></span>
                        <span>🌐 Website: <strong>{websiteCount}</strong></span>
                        <span>📞 Phone: <strong>{phoneCount}</strong></span>
                    </div>
                </div>
            )}

            {/* Combo Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Package size={22} color="var(--primary-light)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Revenue & Order Volume</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {(['7d', '30d'] as const).map(m => (
                            <button key={m} onClick={() => setChartMode(m)}
                                style={{ padding: '0.3rem 0.85rem', borderRadius: '20px', border: `1px solid ${chartMode === m ? '#38bdf8' : 'var(--surface-border)'}`, background: chartMode === m ? '#38bdf8' : 'transparent', color: chartMode === m ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                {m === '7d' ? 'Last 7 days' : 'Last 30 days'}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ height: '340px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={visibleChart} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="onlineRevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.03} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false}
                                tickFormatter={s => { const d = new Date(s); return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`; }} />
                            <YAxis yAxisId="rev" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false}
                                tickFormatter={v => fmtINR(v)} />
                            <YAxis yAxisId="cnt" orientation="right" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false}
                                tickFormatter={v => `${v}`} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '10px', color: 'var(--text-primary)' }}
                                formatter={(value: any, name?: string) => name === 'revenue' ? [fmtINR(Number(value)), 'Revenue'] : [value, 'Orders']}
                                labelFormatter={s => { const d = new Date(s); return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '0.82rem', paddingTop: '0.5rem' }} />
                            <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="url(#onlineRevGrad)" stroke="#38bdf8" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                            <Line yAxisId="cnt" dataKey="orders" name="Orders" type="monotone" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 3, fill: '#a78bfa' }} activeDot={{ r: 5 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Payment Mode Split */}
            {orders.length > 0 && totalRevenue > 0 && (
                <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
                    <p style={{ margin: '0 0 0.6rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Payment Method Split</p>
                    <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', height: '28px', gap: '2px' }}>
                        <div style={{ flex: prepaidRev, background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, minWidth: '2px' }}>
                            {Math.round(prepaidRev * 100 / totalRevenue) > 8 ? `Prepaid ${Math.round(prepaidRev * 100 / totalRevenue)}%` : ''}
                        </div>
                        <div style={{ flex: codRev, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, minWidth: '2px' }}>
                            {Math.round(codRev * 100 / totalRevenue) > 8 ? `COD ${Math.round(codRev * 100 / totalRevenue)}%` : ''}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                        <span>🟣 Prepaid: {fmtINR(prepaidRev)}</span>
                        <span>🟡 COD: {fmtINR(codRev)}</span>
                    </div>
                </div>
            )}

            {/* Recent orders link */}
            <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
                <Link to="/online-orders" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                    View & Manage All Online Orders →
                </Link>
            </div>
        </div>
    );
}

// tiny stub to avoid importing TrendingUp twice via destructure
function TrendingUpIcon({ size, color }: { size: number; color: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    );
}
