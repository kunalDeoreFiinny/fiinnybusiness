import { useState, useEffect } from 'react';
import { Printer, FileText, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getTenantCollection } from '../utils/tenantPath';
import { fetchInvoiceTemplate, fetchInvoiceBranding } from '../services/invoiceTemplateService';
import { printThermalInvoice, downloadInvoicePDF, emailInvoice } from '../utils/invoiceEngine';

interface Props {
    retailer: any;
    onClose?: () => void;
}

export default function OutstandingInvoice({ retailer, onClose }: Props) {
    const { tenantId } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalOutstanding, setTotalOutstanding] = useState(0);

    useEffect(() => {
        if (!tenantId || !retailer?.id) return;
        const fetchUnpaid = async () => {
            try {
                const col = getTenantCollection(db, tenantId, 'retailers', retailer.id, 'orders');
                const q = query(col, where('paymentStatus', '==', 'Unpaid'));
                const snap = await getDocs(q);
                const data: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setOrders(data);
                setTotalOutstanding(data.reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchUnpaid();
    }, [tenantId, retailer]);

    const getEngineData = () => ({
        orders,
        retailer,
        isOutstanding: true,
    });

    const handleThermal = async () => {
        if (!tenantId) return;
        try {
            const [tmpl, brd] = await Promise.all([fetchInvoiceTemplate(tenantId, 'distributor_retailer'), fetchInvoiceBranding(tenantId)]);
            printThermalInvoice(tmpl, brd, getEngineData());
        } catch { showToast('Print failed.', 'error'); }
    };

    const handlePDF = async () => {
        if (!tenantId) return;
        try {
            const [tmpl, brd] = await Promise.all([fetchInvoiceTemplate(tenantId, 'distributor_retailer'), fetchInvoiceBranding(tenantId)]);
            downloadInvoicePDF(tmpl, brd, getEngineData());
            showToast('Outstanding statement PDF downloaded.', 'success');
        } catch { showToast('PDF generation failed.', 'error'); }
    };

    const handleEmail = async () => {
        if (!tenantId) return;
        try {
            const [tmpl, brd] = await Promise.all([fetchInvoiceTemplate(tenantId, 'distributor_retailer'), fetchInvoiceBranding(tenantId)]);
            const email = emailInvoice(tmpl, brd, getEngineData());
            showToast(email ? `Email opened for ${email}` : 'PDF downloaded. Please attach and send manually.', 'info');
        } catch { showToast('Email failed.', 'error'); }
    };

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            Loading unpaid orders...
        </div>
    );

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <AlertTriangle size={22} color="var(--secondary)" /> Outstanding Statement
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        All unpaid orders for <strong>{retailer?.name}</strong>
                    </p>
                </div>
                {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: '1.5rem' }}>×</button>}
            </div>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                    <p>🎉 No unpaid orders! All dues are cleared.</p>
                </div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ background: 'var(--surface-raised)' }}>
                                <tr>
                                    {['Product', 'Qty', 'Unit', 'Amount', 'Date'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                        <td style={{ padding: '0.75rem 1rem' }}>{o.productName || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>{o.quantity || 1}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>{o.unit || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--danger)', fontWeight: 600 }}>₹ {Number(o.amount).toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                            {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div style={{ padding: '1.25rem 1.5rem', background: 'hsla(0, 84%, 60%, 0.08)', border: '1px solid hsla(0,84%,60%,0.3)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>TOTAL OUTSTANDING</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>₹ {totalOutstanding.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        <button className="btn btn-secondary" onClick={handleThermal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Printer size={18} /> Print Receipt
                        </button>
                        <button className="btn btn-secondary" onClick={handlePDF} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <FileText size={18} /> Download PDF
                        </button>
                        <button className="btn btn-secondary" onClick={handleEmail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Mail size={18} /> Send Email
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
