import { useState, useEffect } from 'react';
import { getDocs, query, orderBy, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { useToast } from '../contexts/ToastContext';
import { Truck, MapPin, Package, CheckCircle, Clock, History } from 'lucide-react';

export default function ManufacturerPortalPage() {
    const { tenantId, linkedId } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'queue' | 'completed'>('queue');

    const fetchOrders = async () => {
        if (!tenantId || !linkedId) return;
        try {
            const snap = await getDocs(query(
                getTenantCollection(db, tenantId, 'salesOrders'),
                where('assignedManufacturerId', '==', linkedId),
                orderBy('createdAt', 'desc')
            ));
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [tenantId, linkedId]);

    const markDispatched = async (order: any) => {
        if (!tenantId) return;
        try {
            await updateDoc(getTenantDoc(db, tenantId, 'salesOrders', order.id), {
                status: 'dispatched',
                dispatchedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            showToast('Order marked as dispatched!', 'success');
            fetchOrders();
        } catch { showToast('Failed to update.', 'error'); }
    };

    const queueOrders = orders.filter((o: any) => o.status === 'confirmed');
    const completedOrders = orders.filter((o: any) => ['dispatched', 'delivered'].includes(o.status));

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading dispatch queue...</div>;

    const tabs = [
        { id: 'queue', label: 'Dispatch Queue', icon: Truck, count: queueOrders.length },
        { id: 'completed', label: 'Completed', icon: History, count: completedOrders.length },
    ] as const;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="primary-gradient-text" style={{ fontSize: '2rem' }}>Dispatch Queue</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Orders assigned to you for dispatch. Ship to the retailer's address as listed below.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.1rem', background: activeTab === tab.id ? 'var(--surface-raised)' : 'transparent', color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)', border: '1px solid', borderColor: activeTab === tab.id ? 'var(--surface-border)' : 'transparent', borderRadius: '10px', cursor: 'pointer', fontWeight: activeTab === tab.id ? 600 : 400, font: 'inherit' }}>
                        <tab.icon size={16} />{tab.label}
                        <span style={{ background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-border)', color: activeTab === tab.id ? 'white' : 'inherit', padding: '1px 7px', borderRadius: '10px', fontSize: '0.72rem' }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Queue */}
            {activeTab === 'queue' && (
                <div className="animate-fade-in">
                    {queueOrders.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                            <h3 style={{ color: 'var(--text-secondary)' }}>Queue is empty!</h3>
                            <p style={{ color: 'var(--text-tertiary)' }}>No pending dispatches at the moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {queueOrders.map((order: any) => (
                                <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--secondary-dark)' }}>{order.orderNumber}</span>
                                            <span style={{ marginLeft: '0.75rem', fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <Clock size={12} /> {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--secondary-dark)', background: 'hsla(45,93%,47%,0.1)' }}>Awaiting Dispatch</span>
                                    </div>

                                    {/* Ship To — Retailer Address */}
                                    <div style={{ background: 'var(--surface-raised)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', fontWeight: 700 }}>📦 Ship To</div>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>{order.retailerName}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            <MapPin size={14} />{order.retailerAddress}
                                        </div>
                                    </div>

                                    {/* Products — NO pricing shown */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', fontWeight: 700 }}>Items to Pack & Ship</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {(order.lineItems || []).map((item: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', background: 'var(--surface-base)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                                        <Package size={15} color="var(--primary-light)" />
                                                        {item.productName}
                                                    </span>
                                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-light)' }}>{item.qty} {item.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {order.notes && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.75rem', background: 'hsla(45,93%,47%,0.06)', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <strong>Instructions:</strong> {order.notes}
                                        </div>
                                    )}

                                    <button className="btn btn-primary animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => markDispatched(order)}>
                                        <Truck size={16} /> Mark as Dispatched
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Completed */}
            {activeTab === 'completed' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {completedOrders.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-tertiary)' }}>No completed dispatches yet.</p>
                        </div>
                    ) : completedOrders.map((order: any) => (
                        <div key={order.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', opacity: 0.8 }}>
                            <div>
                                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{order.orderNumber}</span>
                                <span style={{ marginLeft: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{order.retailerName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{(order.lineItems || []).length} items</span>
                                <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, color: order.status === 'delivered' ? 'var(--success)' : 'var(--primary-light)', background: order.status === 'delivered' ? 'hsla(142,60%,40%,0.1)' : 'hsla(152,60%,40%,0.1)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    {order.status === 'delivered' ? <CheckCircle size={12} /> : <Truck size={12} />}
                                    {order.status === 'delivered' ? 'Delivered' : 'Dispatched'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
