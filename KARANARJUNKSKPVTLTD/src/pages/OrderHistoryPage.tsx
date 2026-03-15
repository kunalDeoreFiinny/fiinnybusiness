import { useState, useEffect } from 'react';
import { ShoppingCart, FileText, Loader2, Search } from 'lucide-react';
import { query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection } from '../utils/tenantPath';
import { downloadInvoicePDF } from '../utils/invoiceEngine';
import { fetchInvoiceTemplate, fetchInvoiceBranding } from '../services/invoiceTemplateService';

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

export default function OrderHistoryPage() {
    const { tenantId, tenantData } = useAuth();
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!tenantId) return;
        const q = query(getTenantCollection(db, tenantId, 'salesOrders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SalesOrder[];
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId]);

    const handleReprint = async (order: SalesOrder) => {
        if (!tenantId || !tenantData) return;

        try {
            const [tmpl, brd] = await Promise.all([
                fetchInvoiceTemplate(tenantId, 'retailer_customer'), // Defaulting to simple thermal format template for reprint
                fetchInvoiceBranding(tenantId),
            ]);

            const invoiceData = {
                invoiceNumber: order.orderNumber || `POS-${order.id.substring(0, 6).toUpperCase()}`,
                retailer: {
                    name: order.retailerName,
                    atPost: '',
                    number: order.phoneNumber || ''
                },
                order: {
                    id: order.id,
                    amount: order.grandTotal
                },
                orders: order.lineItems.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    unit: item.unit,
                    mrp: item.mrp || 0,
                    amount: item.amount || item.lineTotal || 0,
                    gstPct: item.gstPct || 0
                })),
                isOutstanding: false
            };

            await downloadInvoicePDF(tmpl, brd, invoiceData);
        } catch (error) {
            console.error("Invoice reprint failed", error);
            alert("Failed to reprint invoice");
        }
    };

    const filteredOrders = orders.filter(o => 
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.retailerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <Loader2 size={48} className="spin" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Loading Order History...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <ShoppingCart size={32} /> Order History
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View and reprint previously generated POS bills and Sales Orders.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        placeholder="Search by Bill No or Customer Name..."
                        className="input-field"
                        style={{ paddingLeft: '2.5rem', margin: 0 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Bill No</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Customer Name</th>
                            <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Total Amount</th>
                            <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                    <p>No orders found.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A';
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background-color 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {dateStr}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {order.orderNumber || 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {order.retailerName || 'Walk-in'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-light)' }}>
                                            ₹{order.grandTotal?.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleReprint(order)}
                                                    className="btn btn-secondary"
                                                    title="Reprint Bill"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                                                >
                                                    <FileText size={16} /> Reprint
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
