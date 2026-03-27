import { useState, useEffect } from 'react';
import { getDocs, query, orderBy, where, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { useToast } from '../contexts/ToastContext';
import { Truck, MapPin, Package, CheckCircle, Clock, History, FileText, AlertCircle, RefreshCw, UploadCloud, X, Paperclip, ExternalLink } from 'lucide-react';

const STATUS_FLOW = [
    { key: 'placed',     label: 'Placed',     color: '#6366f1' },
    { key: 'confirmed',  label: 'Confirmed',  color: '#f59e0b' },
    { key: 'dispatched', label: 'Dispatched', color: '#0ea5e9' },
    { key: 'delivered',  label: 'Delivered',  color: '#10b981' },
    { key: 'invoiced',   label: 'Invoiced',   color: '#84cc16' },
];

function StatusTracker({ status }: { status: string }) {
    const idx = STATUS_FLOW.findIndex(s => s.key === status);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '1rem', overflowX: 'auto' }}>
            {STATUS_FLOW.map((s, i) => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= idx ? s.color : 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= idx ? '#fff' : 'var(--text-tertiary)', fontSize: '0.7rem', fontWeight: 800, transition: 'all 0.3s' }}>
                            {i < idx ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: '0.6rem', fontWeight: i === idx ? 700 : 400, color: i <= idx ? s.color : 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                    {i < STATUS_FLOW.length - 1 && <div style={{ flex: 1, height: 2, background: i < idx ? s.color : 'var(--surface-border)', margin: '0 4px', marginBottom: '1rem', transition: 'background 0.3s' }} />}
                </div>
            ))}
        </div>
    );
}

export default function ManufacturerPortalPage() {
    const { tenantId, linkedId } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
    
    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [uploadDocType, setUploadDocType] = useState('Invoice');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

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

    const updateStatus = async (order: any, newStatus: string, extra?: Record<string, any>) => {
        if (!tenantId) return;
        setActionLoading(order.id);
        try {
            await updateDoc(getTenantDoc(db, tenantId, 'salesOrders', order.id), {
                status: newStatus,
                [`${newStatus}At`]: serverTimestamp(),
                updatedAt: serverTimestamp(),
                ...extra,
            });
            showToast(`Order ${newStatus}!`, 'success');
            fetchOrders();
        } catch { showToast('Action failed.', 'error'); }
        finally { setActionLoading(null); }
    };

    const generateInvoice = async (order: any) => {
        if (!tenantId) return;
        setActionLoading(order.id + '_invoice');
        try {
            const grandTotal = (order.lineItems || []).reduce((s: number, i: any) => s + (i.amount || 0), 0);
            await addDoc(getTenantCollection(db, tenantId, 'invoices'), {
                type: 'manufacturer_retailer',
                retailerId: order.retailerId,
                retailerName: order.retailerName,
                salesOrderId: order.id,
                salesOrderNumber: order.orderNumber,
                lineItems: order.lineItems || [],
                grandTotal,
                paymentStatus: 'Unpaid',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            await updateStatus(order, 'invoiced', { invoicedAt: serverTimestamp() });
            showToast('Invoice generated!', 'success');
        } catch { showToast('Invoice generation failed.', 'error'); }
        finally { setActionLoading(null); }
    };

    const handleFileUpload = async () => {
        if (!tenantId || !selectedOrderId || !selectedFile) return;
        setIsUploading(true);
        try {
            const fileRef = ref(storage, `tenants/${tenantId}/salesOrders/${selectedOrderId}/documents/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
            await uploadBytes(fileRef, selectedFile);
            const downloadUrl = await getDownloadURL(fileRef);

            const orderRef = getTenantDoc(db, tenantId, 'salesOrders', selectedOrderId);
            const orderDoc = orders.find(o => o.id === selectedOrderId);
            const existingDocs = orderDoc?.documents || [];
            
            await updateDoc(orderRef, {
                documents: [...existingDocs, {
                    name: selectedFile.name,
                    url: downloadUrl,
                    type: uploadDocType,
                    uploadedAt: new Date().toISOString()
                }]
            });
            
            showToast('Document uploaded successfully!', 'success');
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            fetchOrders();
        } catch (error) {
            console.error("Upload error: ", error);
            showToast('Failed to upload document.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const pendingOrders = orders.filter(o => ['placed'].includes(o.status));
    const activeOrders = orders.filter(o => ['confirmed', 'dispatched', 'delivered'].includes(o.status));
    const completedOrders = orders.filter(o => ['invoiced', 'cancelled'].includes(o.status));

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={32} style={{ margin: '0 auto 1rem', display: 'block', animation: 'spin 1s linear infinite' }} />
            Loading orders...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const tabs = [
        { id: 'pending',   label: 'New Orders',   icon: AlertCircle, count: pendingOrders.length,   color: '#ef4444' },
        { id: 'active',    label: 'In Progress',  icon: Truck,        count: activeOrders.length,    color: '#f59e0b' },
        { id: 'completed', label: 'Completed',    icon: History,      count: completedOrders.length, color: '#10b981' },
    ] as const;

    const visibleOrders = activeTab === 'pending' ? pendingOrders : activeTab === 'active' ? activeOrders : completedOrders;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="primary-gradient-text" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Truck size={32} /> Manufacturer Portal
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage orders — confirm, dispatch, mark delivered, and auto-generate invoices.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {tabs.map(tab => (
                    <div key={tab.id} style={{ padding: '1.25rem', background: 'var(--surface-raised)', border: `1px solid ${tab.color}30`, borderLeft: `3px solid ${tab.color}`, borderRadius: '14px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tab.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: tab.color }}>{tab.count}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '1.5rem' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.1rem', background: activeTab === tab.id ? 'var(--surface-raised)' : 'transparent', color: activeTab === tab.id ? tab.color : 'var(--text-tertiary)', border: '1px solid', borderColor: activeTab === tab.id ? 'var(--surface-border)' : 'transparent', borderRadius: '10px', cursor: 'pointer', fontWeight: activeTab === tab.id ? 700 : 400, font: 'inherit' }}>
                        <tab.icon size={15} />{tab.label}
                        {tab.count > 0 && <span style={{ background: tab.color, color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.72rem' }}>{tab.count}</span>}
                    </button>
                ))}
            </div>

            {/* Order Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {visibleOrders.length === 0 && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                        <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem auto', display: 'block', opacity: 0.6 }} />
                        <p style={{ color: 'var(--text-secondary)' }}>No orders in this category.</p>
                    </div>
                )}
                {visibleOrders.map((order: any) => (
                    <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${STATUS_FLOW.find(s => s.key === order.status)?.color || 'var(--surface-border)'}` }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{order.orderNumber}</span>
                                <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Clock size={12} /> {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString('en-IN') : ''}
                                </span>
                            </div>
                            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, color: STATUS_FLOW.find(s => s.key === order.status)?.color, background: `${STATUS_FLOW.find(s => s.key === order.status)?.color}15` }}>
                                {STATUS_FLOW.find(s => s.key === order.status)?.label || order.status}
                            </span>
                        </div>

                        {/* Status Tracker */}
                        <StatusTracker status={order.status} />

                        {/* Ship To */}
                        <div style={{ background: 'var(--surface-raised)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} color="var(--primary-light)" style={{ flexShrink: 0 }} />
                            <div>
                                <span style={{ fontWeight: 700 }}>{order.retailerName}</span>
                                {order.retailerAddress && <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{order.retailerAddress}</span>}
                            </div>
                        </div>

                        {/* Items */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Package size={12} /> Items to Pack
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                {(order.lineItems || []).map((item: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--surface-base)', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid var(--surface-border)' }}>
                                        <span style={{ fontWeight: 500 }}>{item.productName}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{item.qty || item.quantity} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {order.notes && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.6rem 0.8rem', background: 'hsla(45,93%,47%,0.06)', borderRadius: '8px', marginBottom: '0.75rem' }}>
                                <strong>Notes:</strong> {order.notes}
                            </div>
                        )}

                        {/* Display Uploaded Documents */}
                        {order.documents && order.documents.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Paperclip size={12} /> Documents
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {order.documents.map((doc: any, i: number) => (
                                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--primary-light)', textDecoration: 'none', transition: 'border-color 0.2s', fontWeight: 500 }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-light)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--surface-border)'}>
                                            <FileText size={14} />
                                            <span>{doc.type}</span>
                                            <ExternalLink size={12} style={{ opacity: 0.6 }} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-border)' }}>
                            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { setSelectedOrderId(order.id); setIsUploadModalOpen(true); setSelectedFile(null); }}>
                                <UploadCloud size={16} /> Upload Doc
                            </button>
                            {order.status === 'placed' && (
                                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={actionLoading === order.id} onClick={() => updateStatus(order, 'confirmed')}>
                                    <CheckCircle size={16} /> {actionLoading === order.id ? 'Confirming...' : '✓ Confirm Order'}
                                </button>
                            )}
                            {order.status === 'confirmed' && (
                                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={actionLoading === order.id} onClick={() => updateStatus(order, 'dispatched')}>
                                    <Truck size={16} /> {actionLoading === order.id ? 'Dispatching...' : '🚚 Mark Dispatched'}
                                </button>
                            )}
                            {order.status === 'dispatched' && (
                                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }} disabled={actionLoading === order.id} onClick={() => updateStatus(order, 'delivered')}>
                                    <CheckCircle size={16} /> {actionLoading === order.id ? 'Updating...' : '✅ Mark Delivered'}
                                </button>
                            )}
                            {order.status === 'delivered' && (
                                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#84cc16', color: '#1a2e05' }} disabled={actionLoading === order.id + '_invoice'} onClick={() => generateInvoice(order)}>
                                    <FileText size={16} /> {actionLoading === order.id + '_invoice' ? 'Generating...' : '🧾 Generate Invoice'}
                                </button>
                            )}
                            {order.status === 'invoiced' && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#84cc16', fontWeight: 700 }}>
                                    <CheckCircle size={16} /> Invoice Generated ✓
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}>
                    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem', position: 'relative' }}>
                        <button onClick={() => setIsUploadModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UploadCloud size={20} color="var(--primary-light)" /> Upload Document
                        </h3>
                        
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Document Type</label>
                            <select className="form-input" style={{ width: '100%', background: 'transparent' }} value={uploadDocType} onChange={e => setUploadDocType(e.target.value)}>
                                <option value="Invoice">Invoice</option>
                                <option value="Sales Order">Sales Order</option>
                                <option value="Claim Document">Claim Document</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Select File</label>
                            <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} style={{ width: '100%', padding: '0.5rem', background: 'var(--surface-raised)', border: '1px dashed var(--surface-border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }} />
                        </div>
                        
                        <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={isUploading || !selectedFile} onClick={handleFileUpload}>
                            {isUploading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <UploadCloud size={16} />}
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
