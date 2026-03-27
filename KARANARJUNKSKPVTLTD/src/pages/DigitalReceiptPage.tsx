import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldCheck, Calendar, Download, Smartphone } from 'lucide-react';
import { fmtINR } from '../utils/gstCalculator';

export default function DigitalReceiptPage() {
    const { tenantId, receiptId } = useParams<{tenantId:string, receiptId:string}>();
    
    const [receipt, setReceipt] = useState<any>(null);
    const [tenantName, setTenantName] = useState('Your Business Name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!tenantId || !receiptId) {
            setError('Invalid receipt link.');
            setLoading(false);
            return;
        }
        
        const fetchReceipt = async () => {
            try {
                // Fetch tenant business name
                const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
                if (tenantSnap.exists() && tenantSnap.data().businessName) {
                    setTenantName(tenantSnap.data().businessName);
                }

                // Receipt is usually a SalesOrder entry
                const snap = await getDoc(doc(db, 'tenants', tenantId, 'salesOrders', receiptId));
                if (snap.exists()) {
                    setReceipt({ id: snap.id, ...snap.data() });
                } else {
                    setError('Receipt not found. It may have been deleted.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to securely load receipt.');
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [tenantId, receiptId]);

    if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:'4rem', color:'var(--text-secondary)' }}>Loading secure receipt...</div>;
    if (error) return <div style={{ textAlign:'center', padding:'4rem', color:'var(--danger)' }}>{error}</div>;
    if (!receipt) return null;

    return (
        <div style={{ maxWidth:'500px', margin:'0 auto', padding:'1rem', fontFamily:'sans-serif' }}>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
                <ShieldCheck size={48} color="var(--success)" style={{ margin:'0 auto', display:'block', marginBottom:'0.5rem' }} />
                <h1 style={{ fontSize:'1.5rem', margin:0, color:'var(--text-primary)' }}>Verified Digital Receipt</h1>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginTop:'0.2rem' }}>Issued by {tenantName}</p>
            </div>

            <div style={{ background:'var(--surface-raised)', borderRadius:'16px', padding:'1.5rem', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', border:'1px solid var(--surface-border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px dashed var(--surface-border)', paddingBottom:'1rem', marginBottom:'1rem' }}>
                    <div>
                        <div style={{ fontSize:'0.8rem', color:'var(--text-tertiary)' }}>Gross Total</div>
                        <div style={{ fontSize:'2rem', fontWeight:800, color:'var(--primary-light)' }}>₹{fmtINR(receipt.netAmount || 0)}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:'0.8rem', color:'var(--text-tertiary)' }}>Date</div>
                        <div style={{ fontWeight:600 }}>{receipt.invoiceDate || (receipt.createdAt?.toDate ? new Date(receipt.createdAt.toDate()).toLocaleDateString() : 'N/A')}</div>
                    </div>
                </div>

                <div style={{ marginBottom:'1.5rem' }}>
                    <div style={{ fontSize:'0.85rem', color:'var(--text-tertiary)', marginBottom:'0.5rem' }}>Billed To</div>
                    <div style={{ fontWeight:700, fontSize:'1.1rem' }}>{receipt.retailerName || receipt.customerName || 'Walk-in Customer'}</div>
                    <div style={{ fontSize:'0.9rem', color:'var(--text-secondary)' }}>{receipt.customerPhone || ''}</div>
                </div>

                <h3 style={{ fontSize:'0.9rem', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:'0.5rem', letterSpacing:'1px' }}>Items</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
                    {(receipt.lineItems || []).map((item:any, i:number) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem' }}>
                            <div style={{ flex:1 }}>
                                <div style={{ fontWeight:600 }}>{item.productName}</div>
                                <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{item.qty} {item.unit} x ₹{item.rate}</div>
                            </div>
                            <div style={{ fontWeight:700 }}>₹{fmtINR(item.amount)}</div>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop:'1px dashed var(--surface-border)', paddingTop:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.9rem', color:'var(--text-secondary)' }}>
                        <span>Taxable Value</span>
                        <span>₹{fmtINR(receipt.taxableValue || 0)}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem', fontSize:'0.9rem', color:'var(--text-secondary)' }}>
                        <span>GST Total</span>
                        <span>₹{fmtINR(receipt.totalTax || 0)}</span>
                    </div>
                </div>

                {receipt.paymentStatus === 'Pending' && (
                    <div style={{ background:'hsla(0,84%,60%,0.1)', color:'var(--danger)', padding:'0.75rem', borderRadius:'8px', textAlign:'center', fontWeight:700, fontSize:'0.9rem', display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem' }}>
                        <Calendar size={16}/> Khata Balance Updated (Unpaid)
                    </div>
                )}
            </div>

            <div style={{ marginTop:'2rem', display:'flex', gap:'1rem', justifyContent:'center' }}>
                <button onClick={() => window.print()} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', background:'var(--surface-raised)', border:'1px solid var(--surface-border)', borderRadius:'24px', cursor:'pointer', fontWeight:600, color:'var(--text-primary)' }}>
                    <Download size={16}/> Download PDF
                </button>
                <button style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.5rem', background:'hsla(142,70%,45%,0.15)', border:'1px solid hsla(142,70%,45%,0.3)', borderRadius:'24px', cursor:'pointer', fontWeight:600, color:'hsla(142,70%,40%,1)' }}>
                    <Smartphone size={16}/> Save to WhatsApp
                </button>
            </div>
        </div>
    );
}
