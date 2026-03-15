import { useState, useEffect } from 'react';
import { query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, UserPlus, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';
import { getTenantCollection } from '../utils/tenantPath';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SalesChart from '../components/SalesChart';

interface Retailer {
    id: string;
    name: string;
    location: string;
    number: string;
    portfolioSize: string;
    createdAt: any;
}

export default function DashboardPage() {
    const { userRole, tenantId } = useAuth();
    const { t } = useTranslation();
    const [retailers, setRetailers] = useState<Retailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, big: 0, medium: 0, small: 0, totalRevenue: 0 });
    const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([]);

    useEffect(() => {
        if (!tenantId) return;

        const fetchDashboardData = async () => {
            try {
                // 1. Fetch all retailers for stats
                const retailersQ = query(getTenantCollection(db, tenantId, 'retailers'), orderBy('createdAt', 'desc'));
                const retailersSnapshot = await getDocs(retailersQ);

                let total = 0, big = 0, medium = 0, small = 0;
                const fetchedRetailers: Retailer[] = [];

                retailersSnapshot.docs.forEach(doc => {
                    const data = doc.data() as Omit<Retailer, 'id'>;
                    fetchedRetailers.push({ id: doc.id, ...data });
                    total++;
                    if (data.portfolioSize === 'Big') big++;
                    else if (data.portfolioSize === 'Medium') medium++;
                    else small++;
                });

                // 2. Fetch all orders at tenant level for revenue and chart
                let totalRevenue = 0;
                const dailyData: Record<string, number> = {};

                if (userRole === 'admin') {
                    const ordersQ = query(
                        getTenantCollection(db, tenantId, 'orders'),
                        orderBy('createdAt', 'desc'),
                        limit(100) // Get last 100 orders for the trend
                    );
                    const ordersSnapshot = await getDocs(ordersQ);

                    ordersSnapshot.forEach(orderDoc => {
                        const data = orderDoc.data();
                        const amount = Number(data.amount) || 0;
                        totalRevenue += amount;

                        if (data.createdAt) {
                            const dateStr = data.createdAt.toDate().toISOString().split('T')[0];
                            dailyData[dateStr] = (dailyData[dateStr] || 0) + amount;
                        }
                    });
                }

                // Format chart data
                const formattedChartData = Object.entries(dailyData).map(([date, amount]) => ({
                    date,
                    amount
                })).sort((a, b) => a.date.localeCompare(b.date));

                setRetailers(fetchedRetailers.slice(0, 15));
                setStats({ total, big, medium, small, totalRevenue });
                setChartData(formattedChartData);
            } catch (err) {
                console.error("Error fetching dashboard data: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userRole, tenantId]);

    if (userRole !== 'admin') {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>
                <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto' }} />
                <h2>{t('dashboard.access_denied')}</h2>
                <p>{t('dashboard.admin_only')}</p>
                <div style={{ marginTop: '2rem' }}>
                    <Link to="/worklist" className="btn btn-primary animate-pulse" style={{ textDecoration: 'none' }}>{t('dashboard.go_to_worklist')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem' }}>{t('dashboard.welcome_title')}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.motto')}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => {
                            import('../utils/seedData').then(m => {
                                if (tenantId) m.seedDemoData(tenantId);
                            });
                            alert("Seeding started. Please refresh after a few seconds.");
                        }}
                        className="btn btn-secondary"
                    >
                        Seed Demo Data
                    </button>
                    <Link to="/onboarding" className="btn btn-primary animate-pulse" style={{ textDecoration: 'none' }}>
                        <UserPlus size={20} /> {t('dashboard.new_retailer')}
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                <div className="glass-panel animate-fade-in delay-100" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animationFillMode: 'forwards' }}>
                    <div style={{ background: 'hsla(152, 60%, 40%, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                        <Users size={24} color="var(--primary-light)" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('dashboard.total_retailers')}</p>
                        <h2 style={{ margin: 0 }}>{loading ? '-' : stats.total}</h2>
                    </div>
                </div>

                <div className="glass-panel animate-fade-in delay-200" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animationFillMode: 'forwards' }}>
                    <div style={{ background: 'hsla(45, 93%, 47%, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                        <TrendingUp size={24} color="var(--secondary)" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('dashboard.big_customers')}</p>
                        <h2 style={{ margin: 0 }}>{loading ? '-' : stats.big}</h2>
                    </div>
                </div>

                {userRole === 'admin' ? (
                    <div className="glass-panel animate-fade-in delay-300" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animationFillMode: 'forwards', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ background: 'hsla(152, 60%, 40%, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                            <TrendingUp size={24} color="var(--primary-light)" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('dashboard.gross_revenue')}</p>
                            <h2 style={{ margin: 0, color: 'var(--primary-light)' }}>
                                {loading ? '-' : `₹${stats.totalRevenue.toLocaleString()}`}
                            </h2>
                        </div>
                    </div>
                ) : (
                    <div className="glass-panel animate-fade-in delay-300" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', animationFillMode: 'forwards' }}>
                        <div style={{ background: 'hsla(220, 10%, 75%, 0.2)', borderRadius: '12px', padding: '1rem' }}>
                            <Users size={24} color="var(--text-secondary)" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('dashboard.small_medium')}</p>
                            <h2 style={{ margin: 0 }}>{loading ? '-' : (stats.small + stats.medium)}</h2>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <BarChart3 size={24} color="var(--primary-light)" />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('dashboard.sales_analytics')}</h2>
                </div>
                <SalesChart data={chartData} />
            </div>

            <h3 style={{ marginBottom: '1rem' }}>{t('dashboard.recent_onboardings')}</h3>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                    {t('dashboard.loading_retailers')}
                </div>
            ) : retailers.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Users size={48} color="var(--surface-border)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>{t('dashboard.no_retailers')}</h3>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>{t('dashboard.no_retailers_desc')}</p>
                    <Link to="/onboarding" className="btn btn-secondary animate-pulse" style={{ textDecoration: 'none' }}>{t('dashboard.new_retailer')}</Link>
                </div>
            ) : (
                <div className="dashboard-grid" style={{ marginTop: '0' }}>
                    {retailers.map((r, i) => (
                        <div key={r.id} className={`glass-panel dashboard-card animate-fade-in delay-${Math.min((i + 1) * 100, 300)}`} style={{ animationFillMode: 'forwards' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{r.name}</h4>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{r.location}</p>
                                </div>
                                <span className={`status-badge ${r.portfolioSize === 'Big' ? 'big' : 'small'}`}>
                                    {r.portfolioSize === 'Big' ? t('dashboard.portfolio_big') : r.portfolioSize === 'Medium' ? t('dashboard.portfolio_medium') : t('dashboard.portfolio_small')}
                                </span>
                            </div>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{r.number}</span>
                                <Link to={`/worklist`} style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>{t('dashboard.view')} →</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
