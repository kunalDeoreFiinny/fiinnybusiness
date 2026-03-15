import { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { Activity, Calendar, Filter, PieChart as PieChartIcon, IndianRupee, ShoppingCart, TrendingUp, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type TimeRange = 'today' | 'week' | 'month' | 'all';

interface RawOrder {
    id: string;
    channel: 'B2B' | 'B2C' | 'Online';
    amount: number;
    createdAt: Date;
}

const COLORS = ['#0ea5e9', '#f59e0b', '#8b5cf6']; // B2B: Sky, B2C: Amber, Online: Purple

export function AnalyticsPage() {
    const { tenantId, userRole } = useAuth();
    const [orders, setOrders] = useState<RawOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    useEffect(() => {
        if (!tenantId) return;

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch B2B (orders)
                const b2bQ = query(getTenantCollection(db, tenantId, 'orders'), orderBy('createdAt', 'desc'), limit(300));
                const b2bSnap = await getDocs(b2bQ);
                const b2bOrders: RawOrder[] = b2bSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        channel: 'B2B',
                        amount: Number(data.amount) || Number(data.invoiceTotal) || 0,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
                    };
                });

                // Fetch B2C (salesOrders)
                const b2cQ = query(getTenantCollection(db, tenantId, 'salesOrders'), orderBy('createdAt', 'desc'), limit(300));
                const b2cSnap = await getDocs(b2cQ);
                const b2cOrders: RawOrder[] = b2cSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        channel: 'B2C',
                        amount: Number(data.grandTotal) || 0,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
                    };
                });

                // Fetch Online (onlineOrders) - This is global, not tenant specific currently, but let's assume global
                const onlineQ = query(collection(db, 'onlineOrders'), orderBy('createdAt', 'desc'), limit(300));
                const onlineSnap = await getDocs(onlineQ);
                const onlineOrders: RawOrder[] = onlineSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        channel: 'Online',
                        amount: Number(data.amount) || 0,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
                    };
                });

                setOrders([...b2bOrders, ...b2cOrders, ...onlineOrders]);
            } catch (err) {
                console.error("Error fetching analytics data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [tenantId]);

    // Filter by TimeRange
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return orders.filter(o => {
            if (timeRange === 'today') return o.createdAt >= startOfToday;
            if (timeRange === 'week') return o.createdAt >= startOfWeek;
            if (timeRange === 'month') return o.createdAt >= startOfMonth;
            return true;
        });
    }, [orders, timeRange]);

    // Compute Metrics
    const metrics = useMemo(() => {
        let totalRevenue = 0;
        let b2bRevenue = 0;
        let b2cRevenue = 0;
        let onlineRevenue = 0;

        filteredOrders.forEach(o => {
            totalRevenue += o.amount;
            if (o.channel === 'B2B') b2bRevenue += o.amount;
            if (o.channel === 'B2C') b2cRevenue += o.amount;
            if (o.channel === 'Online') onlineRevenue += o.amount;
        });

        const totalOrders = filteredOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        let topChannel = 'N/A';
        const maxRev = Math.max(b2bRevenue, b2cRevenue, onlineRevenue);
        if (maxRev > 0) {
            if (maxRev === b2bRevenue) topChannel = 'B2B';
            else if (maxRev === b2cRevenue) topChannel = 'B2C';
            else topChannel = 'Online';
        }

        return { totalRevenue, totalOrders, avgOrderValue, topChannel, b2bRevenue, b2cRevenue, onlineRevenue };
    }, [filteredOrders]);

    // Prepare Chart Data
    const { areaData, pieData } = useMemo(() => {
        const pie = [
            { name: 'B2B', value: metrics.b2bRevenue },
            { name: 'B2C', value: metrics.b2cRevenue },
            { name: 'Online', value: metrics.onlineRevenue },
        ].filter(d => d.value > 0);

        const dailyMap = new Map<string, { date: string; B2B: number; B2C: number; Online: number }>();
        
        filteredOrders.forEach(o => {
            const dateStr = o.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            if (!dailyMap.has(dateStr)) {
                dailyMap.set(dateStr, { date: dateStr, B2B: 0, B2C: 0, Online: 0 });
            }
            const dayData = dailyMap.get(dateStr)!;
            dayData[o.channel] += o.amount;
        });

        const sortedArea = Array.from(dailyMap.values()).sort((a, b) => {
            // Sort roughly by parsing day/month, or just assume they are somewhat ordered if we keep insertion order and reverse
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        return { pieData: pie, areaData: sortedArea };
    }, [filteredOrders, metrics]);

    if (userRole !== 'admin' && userRole !== 'analyst') {
        return <div className="p-8 text-center text-red-500">Access Denied.</div>;
    }

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.5rem', background: `linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(${color},0.1) 100%)`, borderLeft: `4px solid rgb(${color})` }}>
            <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{value}</h3>
                {subtext && <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{subtext}</p>}
            </div>
            <div style={{ background: `rgba(${color}, 0.2)`, padding: '1rem', borderRadius: '12px', color: `rgb(${color})` }}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        <Activity size={32} /> Master Analytics
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Consolidated performance across B2B, B2C, and Online Channels.</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-raised)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                    <Calendar size={18} style={{ color: 'var(--text-tertiary)', marginLeft: '0.5rem' }} />
                    <select 
                        className="input-field" 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                        style={{ border: 'none', background: 'transparent', paddingLeft: '0.5rem', width: '150px' }}
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--text-tertiary)' }}>
                    <Activity className="animate-spin" size={32} style={{ color: 'var(--primary-light)' }} />
                    <span style={{ marginLeft: '1rem' }}>Aggregating multi-channel data...</span>
                </div>
            ) : (
                <>
                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <StatCard 
                            title="Total Blended Revenue" 
                            value={`₹${metrics.totalRevenue.toLocaleString()}`} 
                            icon={IndianRupee} 
                            color="34, 197, 94" // Green
                            subtext={`Across ${metrics.totalOrders} total orders`}
                        />
                        <StatCard 
                            title="Combine Order Volume" 
                            value={metrics.totalOrders} 
                            icon={ShoppingCart} 
                            color="14, 165, 233" // Sky blue
                            subtext="B2B + B2C + Online"
                        />
                        <StatCard 
                            title="Average Order Value" 
                            value={`₹${Math.round(metrics.avgOrderValue).toLocaleString()}`} 
                            icon={TrendingUp} 
                            color="245, 158, 11" // Amber
                            subtext="Blended average"
                        />
                        <StatCard 
                            title="Top Channel" 
                            value={metrics.topChannel} 
                            icon={Layers} 
                            color="168, 85, 247" // Purple
                            subtext="Highest revenue driver"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
                        {/* Stacked Chart */}
                        <div className="glass-panel" style={{ padding: '1.5rem', height: '450px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Filter size={20} style={{ color: 'var(--primary-light)' }} /> Channel Revenue Timeline
                            </h3>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                        <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0)+'k' : value}`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                            itemStyle={{ fontWeight: 600 }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ top: -10, right: 0 }} />
                                        <Area type="monotone" dataKey="B2B" stackId="1" stroke={COLORS[0]} fill={COLORS[0]} />
                                        <Area type="monotone" dataKey="B2C" stackId="1" stroke={COLORS[1]} fill={COLORS[1]} />
                                        <Area type="monotone" dataKey="Online" stackId="1" stroke={COLORS[2]} fill={COLORS[2]} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div className="glass-panel" style={{ padding: '1.5rem', height: '450px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <PieChartIcon size={20} style={{ color: 'var(--primary-light)' }} /> Revenue Split
                            </h3>
                            <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                                                contentStyle={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>No data available for the selected range.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
