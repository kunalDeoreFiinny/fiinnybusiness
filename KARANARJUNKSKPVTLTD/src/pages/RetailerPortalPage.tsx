import { useState, useEffect } from 'react';
import { getDocs, getDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { ShoppingCart, FileText, User, Package, Truck, CheckCircle, Clock } from 'lucide-react';

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Draft', color: 'var(--text-tertiary)', bg: 'var(--surface-raised)' },
    confirmed: { label: 'Confirmed', color: 'var(--secondary-dark)', bg: 'hsla(45,93%,47%,0.1)' },
    dispatched: { label: 'Dispatched', color: 'var(--primary-light)', bg: 'hsla(152,60%,40%,0.1)' },
    delivered: { label: 'Delivered', color: 'var(--success)', bg: 'hsla(142,60%,40%,0.08)' },
    cancelled: { label: 'Cancelled', color: 'var(--danger)', bg: 'hsla(0,84%,60%,0.08)' },
};

export default function RetailerPortalPage() {
    const { tenantId, linkedId } = useAuth();
    const [retailer, setRetailer] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'account'>('orders');

    useEffect(() => {
        if (!tenantId || !linkedId) return;
        const fetch = async () => {
            const [rSnap, oSnap] = await Promise.all([
                getDoc(getTenantDoc(db, tenantId, 'retailers', linkedId)),
                getDocs(query(getTenantCollection(db, tenantId, 'salesOrders'), where('retailerId', '==', linkedId), orderBy('createdAt', 'desc'))),
            ]);
            if (rSnap.exists()) setRetailer({ id: rSnap.id, ...rSnap.data() });
            setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        };
        fetch();
    }, [tenantId, linkedId]);

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading your account...</div>;
    if (!retailer) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>Account not found. Please contact administrator.</div>;

    const tabs = [
        { id: 'orders', label: 'My Orders', icon: ShoppingCart, count: orders.length },
        { id: 'account', label: 'My Account', icon: User },
    ] as const;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="primary-gradient-text" style={{ fontSize: '2rem' }}>{retailer.name}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{retailer.atPost}, {retailer.taluka}, {retailer.district}</p>
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--secondary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Orders Value</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{Number(retailer.totalSales || 0).toLocaleString()}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Amount Paid</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-light)' }}>₹{Number(retailer.totalPaid || 0).toLocaleString()}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--danger)', background: Number(retailer.outstandingAmount || 0) > 0 ? 'hsla(0,84%,60%,0.04)' : undefined }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Outstanding</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: Number(retailer.outstandingAmount || 0) > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>₹{Number(retailer.outstandingAmount || 0).toLocaleString()}</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.1rem', background: activeTab === tab.id ? 'var(--surface-raised)' : 'transparent', color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)', border: '1px solid', borderColor: activeTab === tab.id ? 'var(--surface-border)' : 'transparent', borderRadius: '10px', cursor: 'pointer', fontWeight: activeTab === tab.id ? 600 : 400, font: 'inherit' }}>
                        <tab.icon size={16} />{tab.label}
                        {'count' in tab && <span style={{ background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-border)', color: activeTab === tab.id ? 'white' : 'inherit', padding: '1px 7px', borderRadius: '10px', fontSize: '0.72rem' }}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div className="animate-fade-in">
                    {orders.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                            <ShoppingCart size={40} color="var(--surface-border)" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                            <p style={{ color: 'var(--text-tertiary)' }}>No orders placed yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map((order: any) => {
                                const badge = STATUS_BADGE[order.status] || STATUS_BADGE.draft;
                                return (
                                    <div key={order.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div>
                                                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{order.orderNumber}</span>
                                                <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : ''}</span>
                                            </div>
                                            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, color: badge.color, background: badge.bg, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {order.status === 'delivered' ? <CheckCircle size={12} /> : order.status === 'dispatched' ? <Truck size={12} /> : <Clock size={12} />}
                                                {badge.label}
                                            </span>
                                        </div>
                                        {/* Products list */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                                            {(order.lineItems || []).map((item: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}><Package size={13} />{item.productName}</span>
                                                    <span>{item.qty} {item.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: order.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                                {order.paymentStatus === 'Paid' ? '✓ Paid' : '⚠ Payment Pending'}
                                            </span>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-light)' }}>₹{Number(order.grandTotal).toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} color="var(--primary-light)" /> Business Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                        {[
                            ['Business Name', retailer.name],
                            ['Contact', retailer.number],
                            ['Email', retailer.email || '-'],
                            ['Village / At Post', retailer.atPost],
                            ['Taluka', retailer.taluka],
                            ['District', retailer.district],
                            ['State', retailer.state],
                            ['GSTIN', retailer.gstin || '-'],
                            ['Licence Number', retailer.licenseNumber || '-'],
                            ['Customer Type', retailer.portfolioSize],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{label}</div>
                                <div style={{ fontWeight: 500 }}>{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
