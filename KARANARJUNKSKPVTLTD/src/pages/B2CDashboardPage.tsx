import { useState, useEffect } from 'react';
import { query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingCart, TrendingUp, ShieldAlert, BarChart3, ReceiptText } from 'lucide-react';
import { getTenantCollection } from '../utils/tenantPath';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SalesChart from '../components/SalesChart';

interface SalesOrder {
    id: string;
    orderNumber: string;
    retailerName: string;
    phoneNumber?: string;
    subtotal: number;
    grandTotal: number;
    paymentStatus: string;
    createdAt?: any;
    lineItems: any[];
}

export default function B2CDashboardPage() {
    const { userRole, tenantId } = useAuth();
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, todayRevenue: 0 });
    const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([]);

    useEffect(() => {
        if (!tenantId) return;

        const fetchDashboardData = async () => {
            try {
                // Fetch recent B2C POS orders
                const ordersQ = query(
                    getTenantCollection(db, tenantId, 'salesOrders'),
                    orderBy('createdAt', 'desc'),
                    limit(100) // limit for analytics chart
                );
                
                const ordersSnapshot = await getDocs(ordersQ);

                let totalOrders = 0;
                let totalRevenue = 0;
                let todayRevenue = 0;
                const fetchedOrders: SalesOrder[] = [];
                const dailyData: Record<string, number> = {};

                const todayStr = new Date().toISOString().split('T')[0];

                ordersSnapshot.docs.forEach(doc => {
                    const data = doc.data() as Omit<SalesOrder, 'id'>;
                    const orderData = { id: doc.id, ...data };
                    
                    fetchedOrders.push(orderData);
                    totalOrders++;
                    
                    const amount = Number(data.grandTotal) || 0;
                    totalRevenue += amount;

                    if (data.createdAt) {
                        const dateStr = data.createdAt.toDate().toISOString().split('T')[0];
                        dailyData[dateStr] = (dailyData[dateStr] || 0) + amount;
                        
                        if (dateStr === todayStr) {
                            todayRevenue += amount;
                        }
                    }
                });

                // Format chart data
                const formattedChartData = Object.entries(dailyData).map(([date, amount]) => ({
                    date,
                    amount
                })).sort((a, b) => a.date.localeCompare(b.date));

                setOrders(fetchedOrders.slice(0, 15)); // Only show top 15 in the list
                setStats({ totalOrders, totalRevenue, todayRevenue });
                setChartData(formattedChartData);
            } catch (err) {
                console.error("Error fetching B2C dashboard data: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userRole, tenantId]);

    // Analysts usually don't see financial dashboards, but we'll let admins control this via RoleMatrix
    if (userRole !== 'admin' && userRole !== 'analyst') {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>
                <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h2>Access Denied</h2>
                <p>Only authorized personnel can view the dashboard.</p>
                <div style={{ marginTop: '2rem' }}>
                    <Link to="/pos" className="btn btn-primary animate-pulse" style={{ textDecoration: 'none' }}>Go to POS Billing</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem' }}>B2C Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track point-of-sale performance and walk-in walk-in metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/pos" className="btn btn-primary animate-pulse" style={{ textDecoration: 'none' }}>
                        <ShoppingCart size={20} /> New POS Bill
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div className="glass-panel animate-fade-in delay-100" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animationFillMode: 'forwards' }}>
                    <div style={{ background: 'hsla(152, 60%, 40%, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                        <ReceiptText size={24} color="var(--primary-light)" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Recent Orders (Trend)</p>
                        <h2 style={{ margin: 0 }}>{loading ? '-' : stats.totalOrders}</h2>
                    </div>
                </div>

                <div className="glass-panel animate-fade-in delay-200" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animationFillMode: 'forwards' }}>
                    <div style={{ background: 'hsla(45, 93%, 47%, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                        <TrendingUp size={24} color="var(--secondary)" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Today's POS Revenue</p>
                        <h2 style={{ margin: 0 }}>{loading ? '-' : `₹${stats.todayRevenue.toLocaleString()}`}</h2>
                    </div>
                </div>

                <div className="glass-panel animate-fade-in delay-300" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animationFillMode: 'forwards', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ background: 'hsla(152, 60%, 40%, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                        <TrendingUp size={24} color="var(--primary-light)" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Gross B2C Revenue (Trend)</p>
                        <h2 style={{ margin: 0, color: 'var(--primary-light)' }}>
                            {loading ? '-' : `₹${stats.totalRevenue.toLocaleString()}`}
                        </h2>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <BarChart3 size={24} color="var(--primary-light)" />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>POS Sales Analytics</h2>
                </div>
                <SalesChart data={chartData} />
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Recent POS Orders</h3>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                    Loading recent orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <ShoppingCart size={48} color="var(--surface-border)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>No POS Orders</h3>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>You haven't processed any walk-in transactions yet.</p>
                    <Link to="/pos" className="btn btn-secondary animate-pulse" style={{ textDecoration: 'none' }}>Create First Bill</Link>
                </div>
            ) : (
                <div className="dashboard-grid" style={{ marginTop: '0' }}>
                    {orders.map((o, i) => (
                        <div key={o.id} className={`glass-panel dashboard-card animate-fade-in delay-${Math.min((i + 1) * 100, 300)}`} style={{ animationFillMode: 'forwards' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{o.retailerName}</h4>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{o.orderNumber}</p>
                                </div>
                                <span className={`status-badge big`} style={{ backgroundColor: 'hsla(152, 60%, 40%, 0.1)', color: 'var(--primary-light)', padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px' }}>
                                    ₹{o.grandTotal.toLocaleString()}
                                </span>
                            </div>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
                                <Link to={`/order-history`} style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>View →</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
