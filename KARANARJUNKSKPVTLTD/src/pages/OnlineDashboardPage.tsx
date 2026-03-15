import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingCart, Truck, Clock, IndianRupee, Activity, Box } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { OnlineOrder } from './OnlineOrdersPage';

export function OnlineDashboardPage() {
    const [orders, setOrders] = useState<OnlineOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'onlineOrders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as OnlineOrder[];
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Calculate Metrics
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.courierSent === 'Yes').length;
    const pendingOrders = orders.filter(o => o.courierSent === 'No').length;
    const grossRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Prepare chart data (Daily Revenue & Order Volume)
    const dailyDataMap = new Map<string, { date: string; revenue: number; orders: number }>();
    
    // Process last 30 days or all available data if less
    orders.forEach(order => {
        if (!order.createdAt) return;
        const dateObj = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        
        if (!dailyDataMap.has(dateStr)) {
            dailyDataMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
        }
        
        const dayData = dailyDataMap.get(dateStr)!;
        dayData.revenue += order.amount || 0;
        dayData.orders += 1;
    });

    const chartData = Array.from(dailyDataMap.values()).reverse(); // Older dates first for chart

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
                <Activity className="animate-spin" size={32} style={{ marginRight: '1rem', color: 'var(--primary-light)' }} />
                Loading Dashboard Data...
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <div className="glass-panel hover-lift" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.5rem', background: `linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(${color},0.1) 100%)`, borderLeft: `4px solid rgb(${color})` }}>
            <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{value}</h3>
                {subtext && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{subtext}</p>}
            </div>
            <div style={{ background: `rgba(${color}, 0.2)`, padding: '1rem', borderRadius: '12px', color: `rgb(${color})` }}>
                <Icon size={28} />
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Activity size={32} /> Online Orders Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Holistic view of B2C online sales performance.</p>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard 
                    title="Total Orders" 
                    value={totalOrders} 
                    icon={ShoppingCart} 
                    color="99, 102, 241" // Indigo
                    subtext="All time online orders"
                />
                <StatCard 
                    title="Gross Revenue" 
                    value={`₹${grossRevenue.toLocaleString('en-IN')}`} 
                    icon={IndianRupee} 
                    color="34, 197, 94" // Green
                    subtext="Total value generated"
                />
                <StatCard 
                    title="Dispatched" 
                    value={deliveredOrders} 
                    icon={Truck} 
                    color="14, 165, 233" // Sky blue
                    subtext="Courier sent"
                />
                <StatCard 
                    title="Pending Dispatch" 
                    value={pendingOrders} 
                    icon={Clock} 
                    color="245, 158, 11" // Amber
                    subtext="Awaiting fulfillment"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                {/* Revenue Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <IndianRupee size={20} style={{ color: 'var(--success)' }} /> Daily Revenue Trend
                    </h3>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--success)' }}
                                />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Volume Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Box size={20} style={{ color: 'var(--primary-light)' }} /> Daily Order Volume
                    </h3>
                    <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-light)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary-light)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--primary-light)' }}
                                />
                                <Area type="monotone" dataKey="orders" name="Orders" stroke="var(--primary-light)" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
