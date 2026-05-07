import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Calendar, MessageCircle, FileText, CheckSquare, ShoppingCart, Loader2, Trash2, Mic, TrendingUp, X, AlertTriangle, FilePen, Printer, PlusCircle } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';
import { getDoc, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantDoc, getTenantCollection } from '../utils/tenantPath';
import { useSchema } from '../contexts/SchemaContext';
import DynamicForm from '../components/DynamicForm';
import OutstandingInvoice from '../components/OutstandingInvoice';


interface Retailer {
    id: string;
    name: string;
    number: string;
    email?: string;
    atPost?: string;
    taluka?: string;
    district?: string;
    state?: string;
    country?: string;
    gstin?: string;
    licenseNumber?: string;
    portfolioSize: string;
    location: string;
    totalSales?: number;
    totalPaid?: number;
    outstandingAmount?: number;
    lastCalledAt?: any;
    lastOrderedAt?: any;
    lastTalkedTo?: string;
    createdAt?: any;
}

interface Order {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    amount: number;
    notes?: string;
    talkedTo?: string;
    paymentStatus: 'Paid' | 'Unpaid';
    isDelivered?: boolean;
    createdAt: any;
}

interface Task {
    id: string;
    title: string;
    status: string;
    dueDate?: string;
    talkedTo?: string;
    createdAt: any;
}

interface Note {
    id: string;
    content: string;
    talkedTo?: string;
    createdAt: any;
}

export default function WorklistDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userRole, tenantId } = useAuth();
    const { t } = useTranslation();
    const { getSchema: _getSchema } = useSchema(); // kept for schema referencing

    const [retailer, setRetailer] = useState<Retailer | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'notes' | 'orders'>('orders');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNoteData] = useState<Note[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [salesOrders, setSalesOrders] = useState<any[]>([]);


    // Financial Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isRecordingPayment, setIsRecordingPayment] = useState(false);

    // Quick Paid Modal
    const [quickPaidOrder, setQuickPaidOrder] = useState<Order | null>(null);
    // Outstanding Invoice Modal
    const [showOutstandingModal, setShowOutstandingModal] = useState(false);
    const [quickPaidRemark, setQuickPaidRemark] = useState('');

    // Form States
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');

    // Advanced Order Form States
    const [dbProducts, setDbProducts] = useState<any[]>([]);

    // Quick-update inline payment notes per order
    const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});
    // Quick-update inline due dates per order
    const [orderDueDates, setOrderDueDates] = useState<Record<string, string>>({});

    // New Note Form States
    const [newNoteTalkedTo, setNewNoteTalkedTo] = useState('');

    useEffect(() => {
        if (!id || !tenantId) return;
        const tid = tenantId!; // For easier use in listeners

        // Fetch Retailer Data
        const fetchRetailer = async () => {
            try {
                const docRef = getTenantDoc(db, tid, 'retailers', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setRetailer({ id: docSnap.id, ...docSnap.data() } as Retailer);
                }
            } catch (error) {
                console.error("Error fetching retailer: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRetailer();

        // Fetch Products
        const unsubProducts = onSnapshot(
            getTenantCollection(db, tenantId!, 'products'),
            (snap) => { setDbProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))); },
            (err) => console.error('Products listener error:', err)
        );

        // Real-time listeners for subcollections
        const tasksQuery = query(getTenantCollection(db, tenantId!, 'retailers', id, 'tasks'), orderBy('createdAt', 'desc'));
        const unsubTasks = onSnapshot(
            tasksQuery,
            (snap) => { setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task))); },
            (err) => console.error('Tasks listener error:', err)
        );

        const notesQuery = query(getTenantCollection(db, tenantId!, 'retailers', id, 'notes'), orderBy('createdAt', 'desc'));
        const unsubNotes = onSnapshot(
            notesQuery,
            (snap) => { setNoteData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note))); },
            (err) => console.error('Notes listener error:', err)
        );

        // orderBy removed — composite index not available; sort client-side instead
        const ordersQuery = query(
            getTenantCollection(db, tid, 'orders'),
            where('retailerId', '==', id)
        );
        const unsubOrders = onSnapshot(
            ordersQuery,
            (snap) => {
                const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
                docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
                setOrders(docs);
            },
            (err) => console.error('Orders listener error:', err)
        );

        const salesOrdersQuery = query(
            getTenantCollection(db, tid, 'salesOrders'),
            where('retailerId', '==', id)
        );
        const unsubSalesOrders = onSnapshot(
            salesOrdersQuery,
            (snap) => {
                type SODoc = { id: string; createdAt?: { seconds?: number }; [key: string]: unknown };
                const docs: SODoc[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SODoc));
                docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
                setSalesOrders(docs);
            },
            (err) => console.error('SalesOrders listener error:', err)
        );

        return () => {
            unsubTasks();
            unsubNotes();
            unsubOrders();
            unsubSalesOrders();
            unsubProducts();
        };
    }, [id, tenantId]);

    const handleWhatsApp = () => {
        if (!retailer?.number) return;
        const phone = retailer.number.replace(/\D/g, ''); // Strip non-digits
        const msg = encodeURIComponent(`Hello ${retailer.name}, this is from KaranArjun Krushi Seva Kendra.`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    };

    const handleDeleteRetailer = async () => {
        if (!id || !tenantId) return;
        const confirmDelete = window.confirm(t('worklist.delete_confirm'));
        if (!confirmDelete) return;

        try {
            await deleteDoc(getTenantDoc(db, tenantId!, 'retailers', id));
            navigate('/worklist');
        } catch (error) {
            console.error('Error deleting retailer:', error);
            alert(t('manage_retailers.delete_error'));
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !tenantId || !newTaskTitle.trim()) return;
        try {
            await addDoc(getTenantCollection(db, tenantId!, 'retailers', id, 'tasks'), {
                title: newTaskTitle,
                status: 'Pending',
                createdAt: serverTimestamp()
            });
            setNewTaskTitle('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !tenantId || !newNoteContent.trim()) return;
        try {
            await addDoc(getTenantCollection(db, tenantId!, 'retailers', id, 'notes'), {
                content: newNoteContent,
                talkedTo: newNoteTalkedTo,
                createdAt: serverTimestamp()
            });
            await updateDoc(getTenantDoc(db, tenantId!, 'retailers', id), {
                lastCalledAt: serverTimestamp(),
                lastTalkedTo: newNoteTalkedTo
            });
            setNewNoteContent('');
            setNewNoteTalkedTo('');
        } catch (error) {
            console.error(error);
        }
    };

    // handleAddOrder & handleEditOrder removed for legacy items

    // ─── Quick status update for B2B sales orders ───
    const updateOrderStatus = async (soId: string, field: 'status' | 'paymentStatus' | 'modeOfPayment', value: string, so: any) => {
        if (!tenantId || !id) return;
        const update: Record<string, any> = { [field]: value };

        // When marking payment as done, adjust retailer outstanding / paid
        if (field === 'paymentStatus') {
            const grandTotal = Number(so.grandTotal || so.netAmount || 0);
            const alreadyPaid = Number(so.amountPaid || 0);
            const newlyPaid = grandTotal - alreadyPaid;

            if (value === 'Paid' && so.paymentStatus !== 'Paid' && newlyPaid > 0) {
                update.amountPaid = grandTotal;
                // update retailer financials
                await updateDoc(getTenantDoc(db, tenantId, 'retailers', id), {
                    totalPaid: (Number(retailer?.totalPaid) || 0) + newlyPaid,
                    outstandingAmount: Math.max(0, (Number(retailer?.outstandingAmount) || 0) - newlyPaid),
                });
                // log payment entry
                await addDoc(getTenantCollection(db, tenantId, 'retailers', id, 'payments'), {
                    amount: newlyPaid,
                    notes: `Quick mark Paid — Order ${so.orderNumber || soId.slice(-6)}`,
                    createdAt: serverTimestamp(),
                });
            }
            if (value === 'Pending' && so.paymentStatus === 'Paid') {
                const revert = Number(so.amountPaid || so.grandTotal || 0);
                update.amountPaid = 0;
                await updateDoc(getTenantDoc(db, tenantId, 'retailers', id), {
                    totalPaid: Math.max(0, (Number(retailer?.totalPaid) || 0) - revert),
                    outstandingAmount: (Number(retailer?.outstandingAmount) || 0) + revert,
                });
            }
        }

        await updateDoc(getTenantDoc(db, tenantId, 'salesOrders', soId), update);
        // Retailer card will auto-refresh via onSnapshot
        const updatedSnap = await getDoc(getTenantDoc(db, tenantId, 'retailers', id));
        setRetailer({ id: updatedSnap.id, ...updatedSnap.data() } as Retailer);
    };

    const handleDeleteOrder = async (order: Order) => {
        if (!id || !tenantId || !window.confirm(t('worklist_details.delete_confirm'))) return;

        try {
            // Revert stock precisely with piece counting
            const p = dbProducts.find(x => x.id === order.productId);
            if (p && p.quantity !== undefined) {
                const cap = p.boxCapacity || 1;
                const stockPiecesToRevert = order.unit === 'Boxes' ? order.quantity * cap : order.quantity;

                const currentTotalPieces = (p.quantity || 0) * cap + (p.loosePieces || 0);
                const newTotalPieces = currentTotalPieces + stockPiecesToRevert;

                const newBoxes = Math.floor(newTotalPieces / cap);
                const newLoose = newTotalPieces % cap;

                await updateDoc(getTenantDoc(db, tenantId!, 'products', p.id), {
                    quantity: newBoxes >= 0 ? newBoxes : 0,
                    loosePieces: newBoxes >= 0 ? newLoose : 0
                });
            }

            // Adjust totals
            const salesSub = order.amount || 0;
            const outstandingSub = order.paymentStatus === 'Unpaid' ? salesSub : 0;

            await updateDoc(getTenantDoc(db, tenantId!, 'retailers', id), {
                totalSales: (Number(retailer?.totalSales) || 0) - salesSub,
                outstandingAmount: Math.max(0, (Number(retailer?.outstandingAmount) || 0) - outstandingSub)
            });

            // Delete doc from unified tenant-level collection
            await deleteDoc(getTenantDoc(db, tenantId!, 'orders', order.id));
            alert(t('worklist_details.stock_reverted'));

            const updatedSnap = await getDoc(getTenantDoc(db, tenantId, 'retailers', id));
            setRetailer({ id: updatedSnap.id, ...updatedSnap.data() } as Retailer);
        } catch (error) {
            console.error("Error deleting order:", error);
            alert(t('worklist_details.order_error'));
        }
    };

    const handleQuickPaid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !tenantId || !quickPaidOrder) return;

        try {
            const amount = quickPaidOrder.amount || 0;
            const remark = quickPaidRemark ? ` | Paid: ${quickPaidRemark}` : ' | Paid via Quick Mark';

            await updateDoc(getTenantDoc(db, tenantId!, 'orders', quickPaidOrder.id), {
                paymentStatus: 'Paid',
                notes: (quickPaidOrder.notes || '') + remark
            });

            // Log payment entry
            await addDoc(getTenantCollection(db, tenantId!, 'retailers', id, 'payments'), {
                amount: amount,
                notes: `Quick Payment for Order ${quickPaidOrder.id.substring(0, 5)}: ${quickPaidRemark}`,
                createdAt: serverTimestamp()
            });

            // Update retailer
            await updateDoc(getTenantDoc(db, tenantId!, 'retailers', id), {
                totalPaid: (Number(retailer?.totalPaid) || 0) + amount,
                outstandingAmount: Math.max(0, (Number(retailer?.outstandingAmount) || 0) - amount)
            });

            setQuickPaidOrder(null);
            setQuickPaidRemark('');
            alert(t('worklist_details.mark_as_paid'));

            const updatedSnap = await getDoc(getTenantDoc(db, tenantId!, 'retailers', id));
            setRetailer({ id: updatedSnap.id, ...updatedSnap.data() } as Retailer);
        } catch (error) {
            console.error("Quick Paid error:", error);
            alert(t('worklist_details.update_error'));
        }
    };

    // handleToggleDelivered removed

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || paymentAmount <= 0) return;
        setIsRecordingPayment(true);

        try {
            // Log the payment in a subcollection
            await addDoc(getTenantCollection(db, tenantId!, 'retailers', id, 'payments'), {
                amount: paymentAmount,
                notes: paymentNotes,
                createdAt: serverTimestamp()
            });

            // Update retailer totals
            const currentPaid = Number(retailer?.totalPaid || 0);
            const currentOutstanding = Number(retailer?.outstandingAmount || 0);

            await updateDoc(getTenantDoc(db, tenantId!, 'retailers', id), {
                totalPaid: currentPaid + paymentAmount,
                outstandingAmount: Math.max(0, currentOutstanding - paymentAmount)
            });

            // Re-fetch retailer
            const updatedSnap = await getDoc(getTenantDoc(db, tenantId!, 'retailers', id));
            setRetailer({ id: updatedSnap.id, ...updatedSnap.data() } as Retailer);

            setShowPaymentModal(false);
            setPaymentAmount(0);
            setPaymentNotes('');
            alert(t('worklist_details.payment_success'));
        } catch (error) {
            console.error("Error recording payment:", error);
            alert(t('worklist_details.update_error'));
        } finally {
            setIsRecordingPayment(false);
        }
    };


    // Invoice helpers using new engine removed for legacy orders



    const [isListening, setIsListening] = useState(false);

    const toggleListen = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t('common.voice_typing_unsupported'));
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setNewNoteContent((prev) => prev ? `${prev} ${transcript}` : transcript);
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}><Loader2 className="animate-spin" style={{ margin: '0 auto', marginBottom: '1rem' }} /> {t('common.loading')}</div>;
    }

    if (!retailer) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>{t('manage_retailers.not_found')}</div>;
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <button
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                onClick={() => navigate('/worklist')}
            >
                <ArrowLeft size={16} /> {t('worklist_details.back_to_worklist')}
            </button>

            {/* Header Profile Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neon-glow)' }}>
                        <User size={40} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{retailer.name}</h1>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {t(`onboarding.portfolio_${retailer.portfolioSize?.split(' ')[0].toLowerCase()}`)} {t('manage_retailers.retailer_type').split(':')[0]}
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <MapPin size={14} /> {retailer.atPost || ''} {retailer.taluka ? `| ${retailer.taluka}` : ''} {retailer.district ? `| ${retailer.district}` : ''}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {retailer.gstin && <span>GSTIN: {retailer.gstin}</span>}
                        {retailer.licenseNumber && <span>Lic: {retailer.licenseNumber}</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        ₹ {t('worklist_details.record_payment')}
                    </button>
                    {retailer?.number && (
                        <a href={`tel:${retailer.number}`} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                            <Phone size={16} /> {t('worklist_details.call')}
                        </a>
                    )}
                    <button onClick={handleWhatsApp} className="btn" style={{ background: '#25D366', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <MessageCircle size={16} /> {t('worklist_details.whatsapp')}
                    </button>
                    {userRole === 'admin' && (
                        <button onClick={handleDeleteRetailer} className="btn" style={{ background: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--danger)', padding: '0.5rem 1rem', fontSize: '0.875rem', border: '1px solid hsla(0, 84%, 60%, 0.2)' }}>
                            <Trash2 size={16} /> {t('worklist_details.delete')}
                        </button>
                    )}
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Sales</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{Number(retailer.totalSales || 0).toLocaleString()}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('worklist_details.amount_paid')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-light)' }}>₹{Number(retailer.totalPaid || 0).toLocaleString()}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger)', background: Number(retailer.outstandingAmount || 0) > 0 ? 'hsla(0, 84%, 60%, 0.05)' : 'transparent' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('worklist_details.outstanding_dues')}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: Number(retailer.outstandingAmount || 0) > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>₹{Number(retailer.outstandingAmount || 0).toLocaleString()}</div>
                </div>
            </div>

            {/* ── Partner Analytics ── */}
            {salesOrders.length > 0 && (() => {
                const totalSales = Number(retailer.totalSales || 0);
                const totalPaid  = Number(retailer.totalPaid  || 0);
                const outstanding = Number(retailer.outstandingAmount || 0);
                const paidPct = totalSales > 0 ? Math.round((totalPaid / totalSales) * 100) : 0;

                const radialData = [
                    { name: 'Paid', value: paidPct, fill: '#10b981' },
                    { name: 'Outstanding', value: 100 - paidPct, fill: '#ef4444' },
                ];

                // Order trend: group salesOrders by month
                const monthMap: Record<string, number> = {};
                salesOrders.forEach((so: any) => {
                    const d = so.createdAt?.toDate ? so.createdAt.toDate() : null;
                    if (!d) return;
                    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                    monthMap[key] = (monthMap[key] || 0) + Number(so.grandTotal || so.netAmount || 0);
                });
                const trendData = Object.entries(monthMap)
                    .map(([month, value]) => ({ month, value }))
                    .slice(-6); // last 6 months

                return (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partner Analytics</h3>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>

                            {/* Radial payment circle */}
                            <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 140 }}>
                                <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%"
                                            startAngle={90} endAngle={-270} data={radialData} barSize={14}>
                                            <RadialBar dataKey="value" cornerRadius={8} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{paidPct}%</span>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>PAID</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>₹{totalPaid.toLocaleString()}</span> paid · <span style={{ color: '#ef4444', fontWeight: 600 }}>₹{outstanding.toLocaleString()}</span> due
                                </div>
                            </div>

                            {/* Vertical divider (hidden on mobile) */}
                            <div style={{ width: '1px', background: 'var(--surface-border)', alignSelf: 'stretch', minHeight: 80 }} />

                            {/* Bar trend chart */}
                            <div style={{ flex: 1, minWidth: 200, minHeight: 120 }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Value Trend</p>
                                {trendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={110}>
                                        <BarChart data={trendData} barSize={22}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.05)" />
                                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: 8, fontSize: '0.78rem' }}
                                                formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, 'Order Value']}
                                            />
                                            <Bar dataKey="value" fill="var(--primary-light)" radius={[4,4,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Not enough data for trend.</p>}
                            </div>

                            {/* Quick stats column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 120 }}>
                                {[
                                    { label: 'Total Orders', value: salesOrders.length },
                                    { label: 'Avg Order', value: `₹${salesOrders.length > 0 ? Math.round(totalSales / salesOrders.length).toLocaleString() : 0}` },
                                    { label: 'Paid Orders', value: salesOrders.filter((s: any) => s.paymentStatus === 'Paid').length },
                                    { label: 'Delivered', value: salesOrders.filter((s: any) => s.status === 'delivered').length },
                                ].map(stat => (
                                    <div key={stat.label} style={{ background: 'var(--surface-raised)', borderRadius: '10px', padding: '0.5rem 0.85rem' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Tabs Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {[
                    { id: 'orders', label: 'B2B Orders', icon: ShoppingCart, count: salesOrders.length },
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'tasks', label: t('worklist_details.tasks'), icon: CheckSquare, count: tasks.length },
                    { id: 'notes', label: t('worklist_details.notes'), icon: FileText, count: notes.length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: activeTab === tab.id ? 'var(--surface-raised)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                            border: '1px solid',
                            borderColor: activeTab === tab.id ? 'var(--surface-border)' : 'transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 600 : 500,
                            transition: 'all 0.2s',
                            font: 'inherit'
                        }}
                    >
                        <tab.icon size={18} color={activeTab === tab.id ? 'var(--primary-light)' : 'currentColor'} />
                        {tab.label}
                        {tab.count !== undefined && (
                            <span style={{ background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-border)', color: activeTab === tab.id ? 'white' : 'inherit', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <div className="glass-panel" style={{ padding: '2rem' }}>

                {activeTab === 'overview' && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={{ gridColumn: '1 / -1', background: 'var(--surface-raised)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Retailer Configurable Profile</h3>
                            <DynamicForm moduleId="retailers" initialData={retailer} readOnly={true} onSubmit={async () => { }} />
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('worklist_details.business_tracking')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--surface-raised)', borderRadius: '10px' }}><Calendar size={20} color="var(--primary-light)" /></div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('worklist_details.last_contact')}</div>
                                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>
                                            {retailer.lastCalledAt ? new Date(retailer.lastCalledAt.seconds * 1000).toLocaleDateString() : t('common.not_available')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--surface-raised)', borderRadius: '10px' }}><ShoppingCart size={20} color="var(--primary-light)" /></div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('worklist_details.last_order')}</div>
                                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>
                                            {retailer.lastOrderedAt ? new Date(retailer.lastOrderedAt.seconds * 1000).toLocaleDateString() : t('common.not_available')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--surface-raised)', borderRadius: '10px' }}><User size={20} color="var(--primary-light)" /></div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('worklist_details.last_person_contacted')}</div>
                                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>{retailer.lastTalkedTo || t('common.not_available')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t('worklist_details.financial_analytics')}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--surface-raised)', borderRadius: '10px' }}><TrendingUp size={20} color="var(--secondary-light)" /></div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('dashboard.gross_revenue')}</div>
                                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>
                                            ₹{orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--surface-raised)', borderRadius: '10px' }}><FileText size={20} color="var(--secondary-light)" /></div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t('worklist_details.average_order_value')}</div>
                                        <div style={{ fontWeight: 500, fontSize: '1.125rem' }}>
                                            ₹{orders.length > 0 ? (orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0) / orders.length).toLocaleString() : 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="animate-fade-in">
                        <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <input
                                required type="text" placeholder={t('worklist_details.add_task_placeholder')}
                                className="input-field" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>+ {t('common.add_new')}</button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {tasks.length === 0 ? <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>{t('worklist_details.no_tasks')}</p> :
                                tasks.map(task => (
                                    <div key={task.id} style={{ padding: '1.25rem', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{task.title}</h4>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                {task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleString() : ''}
                                            </span>
                                        </div>
                                        <span className="status-badge small" style={{ background: 'hsla(38, 92%, 50%, 0.1)', color: 'var(--warning)', borderColor: 'hsla(38, 92%, 50%, 0.3)' }}>{t(`common.status_${task.status?.toLowerCase()}`)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="animate-fade-in">
                        <form onSubmit={handleAddNote} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: '1 1 300px', position: 'relative' }}>
                                <textarea
                                    required placeholder={t('worklist_details.add_note_placeholder')}
                                    className="input-field" style={{ minHeight: '100px', resize: 'vertical' }}
                                    value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={toggleListen}
                                    style={{
                                        position: 'absolute', right: '1rem', bottom: '1rem',
                                        background: isListening ? 'var(--danger)' : 'var(--surface-raised)',
                                        color: isListening ? 'white' : 'var(--text-tertiary)',
                                        border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: 'all 0.2s', boxShadow: isListening ? '0 0 10px var(--danger)' : 'none'
                                    }}
                                    title={t('common.voice_typing')}
                                >
                                    <Mic size={20} className={isListening ? "animate-pulse" : ""} />
                                </button>
                            </div>
                            <div style={{ flex: '0 0 200px' }}>
                                <input
                                    type="text" placeholder={t('worklist_details.talked_to_placeholder')}
                                    className="input-field" value={newNoteTalkedTo} onChange={e => setNewNoteTalkedTo(e.target.value)}
                                />
                                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>{t('common.save')}</button>
                            </div>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notes.length === 0 ? <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>{t('worklist_details.no_notes')}</p> :
                                notes.map(note => (
                                    <div key={note.id} style={{ padding: '1.25rem', background: 'var(--surface-base)', border: '1px solid var(--surface-border)', borderRadius: '10px', borderLeft: '4px solid var(--primary)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{note.content}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                {note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleString() : ''}
                                            </span>
                                            {note.talkedTo && <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 500 }}>{t('worklist_details.talked_to')}: {note.talkedTo}</span>}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-fade-in">
                        {/* Action toolbar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                                className="btn"
                                onClick={() => setShowOutstandingModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'hsla(0,84%,60%,0.08)', color: 'var(--danger)', border: '1px solid hsla(0,84%,60%,0.3)', fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
                            >
                                <AlertTriangle size={16} /> Outstanding Statement
                            </button>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate(`/sales-order/new?retailerId=${id}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.55rem 1.25rem' }}
                                >
                                    <PlusCircle size={16} /> + New Sales Order
                                </button>
                                <button
                                    className="btn btn-primary animate-pulse"
                                    onClick={() => navigate(`/b2b-invoice?retailerId=${id}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.55rem 1.25rem' }}
                                >
                                    <FilePen size={16} /> + New B2B GST Invoice
                                </button>
                            </div>
                        </div>

                        {/* Outstanding Invoice Modal */}
                        {showOutstandingModal && retailer && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                <div className="glass-panel" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}>
                                    <OutstandingInvoice retailer={retailer} onClose={() => setShowOutstandingModal(false)} />
                                </div>
                            </div>
                        )}

                        {/* Sales Orders Table */}
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Sales Orders ({salesOrders.length})</h3>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Edit status &amp; payment inline → Save remarks</span>
                            </div>

                            {salesOrders.length === 0 ? (
                                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    <ShoppingCart size={40} color="var(--surface-border)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                                    <p style={{ margin: 0 }}>No sales orders yet for this partner.</p>
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Use the buttons above to create one.</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1080px' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--surface-raised)' }}>
                                                {['Order No', 'Type', 'Order Status', 'Payment', 'Mode', 'Items', 'Amount', 'Outstanding', 'Due Date', 'Date', 'Remarks', 'Actions'].map(h => (
                                                    <th key={h} style={{
                                                        position: 'sticky', top: 0, zIndex: 5,
                                                        padding: '0.6rem 0.75rem',
                                                        textAlign: 'left',
                                                        fontSize: '0.66rem',
                                                        fontWeight: 700,
                                                        color: 'var(--text-tertiary)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em',
                                                        borderBottom: '2px solid var(--surface-border)',
                                                        background: 'var(--surface-raised)',
                                                        whiteSpace: 'nowrap',
                                                    }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesOrders.map((so: any, idx: number) => {
                                                const statusColors: Record<string, string> = {
                                                    confirmed: '#10b981', draft: '#f59e0b', dispatched: '#38bdf8',
                                                    in_transit: '#38bdf8', delivered: '#10b981', cancelled: '#ef4444', pending: '#94a3b8',
                                                };
                                                const sColor = statusColors[so.status?.toLowerCase()] || '#94a3b8';
                                                const grandTotal = Number(so.grandTotal || so.netAmount || so.totalAmount || 0);
                                                const outstanding = Math.max(0, grandTotal - (Number(so.amountPaid) || 0));
                                                const itemCount = so.lineItems?.length || so.items?.length || 0;
                                                const isGST = so.invoiceType === 'B2B_GST';
                                                const date = so.createdAt?.toDate
                                                    ? new Date(so.createdAt.toDate()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
                                                    : '—';
                                                const rowBg = idx % 2 === 0 ? 'transparent' : 'hsla(0,0%,100%,0.018)';
                                                const cellStyle: React.CSSProperties = {
                                                    padding: '0.55rem 0.75rem',
                                                    borderBottom: '1px solid var(--surface-border)',
                                                    verticalAlign: 'middle',
                                                };

                                                return (
                                                    <tr key={so.id} style={{ background: rowBg, transition: 'background 0.12s' }}
                                                        onMouseOver={e => (e.currentTarget.style.background = 'hsla(152,60%,40%,0.045)')}
                                                        onMouseOut={e => (e.currentTarget.style.background = rowBg)}
                                                    >
                                                        {/* Order No */}
                                                        <td style={cellStyle}>
                                                            <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                                {so.orderNumber || so.invoiceNumber || so.id.slice(-8).toUpperCase()}
                                                            </span>
                                                        </td>

                                                        {/* Invoice Type */}
                                                        <td style={cellStyle}>
                                                            <span style={{
                                                                background: isGST ? '#8b5cf622' : 'hsla(0,0%,100%,0.06)',
                                                                color: isGST ? '#8b5cf6' : 'var(--text-tertiary)',
                                                                padding: '0.18rem 0.45rem', borderRadius: '99px',
                                                                fontSize: '0.66rem', fontWeight: 600, whiteSpace: 'nowrap',
                                                            }}>
                                                                {isGST ? 'GST' : 'Sales'}
                                                            </span>
                                                        </td>

                                                        {/* Order Status — inline select */}
                                                        <td style={{ ...cellStyle, minWidth: '120px' }}>
                                                            <select
                                                                value={so.status || 'draft'}
                                                                onChange={e => updateOrderStatus(so.id, 'status', e.target.value, so)}
                                                                style={{
                                                                    width: '100%', fontSize: '0.74rem', padding: '0.22rem 0.4rem',
                                                                    borderRadius: '7px', border: `1px solid ${sColor}55`,
                                                                    background: `${sColor}18`, color: sColor,
                                                                    cursor: 'pointer', fontWeight: 600,
                                                                }}
                                                            >
                                                                <option value="draft">Draft</option>
                                                                <option value="confirmed">Confirmed</option>
                                                                <option value="in_transit">In Transit</option>
                                                                <option value="dispatched">Dispatched</option>
                                                                <option value="delivered">Delivered</option>
                                                                <option value="cancelled">Cancelled</option>
                                                                <option value="pending">Pending</option>
                                                            </select>
                                                        </td>

                                                        {/* Payment Status — inline select */}
                                                        <td style={{ ...cellStyle, minWidth: '110px' }}>
                                                            <select
                                                                value={so.paymentStatus || 'Pending'}
                                                                onChange={e => updateOrderStatus(so.id, 'paymentStatus', e.target.value, so)}
                                                                style={{
                                                                    width: '100%', fontSize: '0.74rem', padding: '0.22rem 0.4rem',
                                                                    borderRadius: '7px',
                                                                    border: '1px solid',
                                                                    borderColor: so.paymentStatus === 'Paid' ? '#10b98144' : so.paymentStatus === 'Partial' ? '#f59e0b44' : '#ef444444',
                                                                    background: so.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.1)' : so.paymentStatus === 'Partial' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.08)',
                                                                    color: so.paymentStatus === 'Paid' ? '#10b981' : so.paymentStatus === 'Partial' ? '#f59e0b' : '#ef4444',
                                                                    cursor: 'pointer', fontWeight: 600,
                                                                }}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Paid">Paid</option>
                                                                <option value="Partial">Partial</option>
                                                            </select>
                                                        </td>

                                                        {/* Payment Mode — inline select */}
                                                        <td style={{ ...cellStyle, minWidth: '100px' }}>
                                                            <select
                                                                value={so.modeOfPayment || ''}
                                                                onChange={e => updateOrderStatus(so.id, 'modeOfPayment', e.target.value, so)}
                                                                style={{
                                                                    width: '100%', fontSize: '0.74rem', padding: '0.22rem 0.4rem',
                                                                    borderRadius: '7px', border: '1px solid var(--surface-border)',
                                                                    background: 'var(--surface-raised)', color: 'var(--text-primary)', cursor: 'pointer',
                                                                }}
                                                            >
                                                                <option value="">—</option>
                                                                <option value="Cash">Cash</option>
                                                                <option value="UPI">UPI</option>
                                                                <option value="Cheque">Cheque</option>
                                                                <option value="Credit">Credit</option>
                                                                <option value="Bank Transfer">Bank Transfer</option>
                                                            </select>
                                                        </td>

                                                        {/* Items Count */}
                                                        <td style={{ ...cellStyle, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                                            {itemCount}
                                                        </td>

                                                        {/* Amount */}
                                                        <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                                                            <span style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.88rem' }}>
                                                                ₹{grandTotal.toLocaleString()}
                                                            </span>
                                                        </td>

                                                        {/* Outstanding — paymentStatus is the source of truth */}
                                                        <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                                                            {grandTotal === 0
                                                                ? <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>—</span>
                                                                : so.paymentStatus === 'Paid'
                                                                    ? <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.78rem' }}>✓ Clear</span>
                                                                    : outstanding > 0
                                                                        ? <span style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.8rem' }}>₹{outstanding.toLocaleString()}</span>
                                                                        : <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.78rem' }}>Pending</span>
                                                            }
                                                        </td>

                                                        {/* Due Date */}
                                                        <td style={{ ...cellStyle, minWidth: '140px' }}>
                                                            <input
                                                                type="date"
                                                                value={orderDueDates[so.id] ?? (so.dueDate || '')}
                                                                onChange={async e => {
                                                                    const val = e.target.value;
                                                                    setOrderDueDates(prev => ({ ...prev, [so.id]: val }));
                                                                    if (!tenantId) return;
                                                                    await updateDoc(getTenantDoc(db, tenantId, 'salesOrders', so.id), { dueDate: val });
                                                                }}
                                                                style={{
                                                                    width: '100%', fontSize: '0.72rem', padding: '0.2rem 0.35rem',
                                                                    borderRadius: '6px', border: '1px solid var(--surface-border)',
                                                                    background: 'var(--surface-raised)', color: 'var(--text-primary)', cursor: 'pointer',
                                                                }}
                                                            />
                                                            {(() => {
                                                                const ds = orderDueDates[so.id] ?? so.dueDate;
                                                                if (!ds) return null;
                                                                const due = new Date(ds);
                                                                if (isNaN(due.getTime())) return null;
                                                                const today = new Date(); today.setHours(0, 0, 0, 0);
                                                                const diff = Math.round((due.getTime() - today.getTime()) / 864e5);
                                                                const label = diff === 0 ? 'Due Today' : diff < 0 ? `Overdue ${Math.abs(diff)}d` : `Due in ${diff}d`;
                                                                const c = diff < 0 ? '#ef4444' : diff <= 3 ? '#f59e0b' : '#10b981';
                                                                return <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.67rem', fontWeight: 700, color: c }}>{label}</span>;
                                                            })()}
                                                        </td>

                                                        {/* Date */}
                                                        <td style={{ ...cellStyle, color: 'var(--text-tertiary)', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                                                            {date}
                                                        </td>

                                                        {/* Remarks — inline input */}
                                                        <td style={{ ...cellStyle, minWidth: '160px' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Remarks…"
                                                                value={orderNotes[so.id] ?? (so.paymentNotes || '')}
                                                                onChange={e => setOrderNotes(prev => ({ ...prev, [so.id]: e.target.value }))}
                                                                style={{
                                                                    width: '100%', fontSize: '0.74rem',
                                                                    padding: '0.22rem 0.5rem', borderRadius: '6px',
                                                                    border: '1px solid var(--surface-border)',
                                                                    background: 'var(--surface-raised)', color: 'var(--text-primary)',
                                                                }}
                                                            />
                                                        </td>

                                                        {/* Actions */}
                                                        <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                                                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    title="Save remarks"
                                                                    style={{ fontSize: '0.7rem', padding: '0.22rem 0.55rem' }}
                                                                    onClick={async () => {
                                                                        await updateDoc(getTenantDoc(db, tenantId!, 'salesOrders', so.id), {
                                                                            paymentNotes: orderNotes[so.id] ?? so.paymentNotes ?? '',
                                                                        });
                                                                    }}
                                                                >Save</button>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    title="Edit Order"
                                                                    style={{ padding: '0.22rem 0.4rem' }}
                                                                    onClick={() => so.invoiceType === 'B2B_GST'
                                                                        ? navigate(`/b2b-invoice?orderId=${so.id}&retailerId=${id}`)
                                                                        : navigate(`/sales-order/${so.id}`)}
                                                                >
                                                                    <FilePen size={13} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    title="View / Print Invoice"
                                                                    style={{ padding: '0.22rem 0.4rem' }}
                                                                    onClick={() => navigate(`/b2b-invoice?orderId=${so.id}&retailerId=${id}`)}
                                                                >
                                                                    <Printer size={13} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Legacy Orders */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Legacy Single-Item Orders</h3>
                            {orders.length === 0 ? <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>{t('worklist_details.no_orders')}</p> :
                                orders.map(order => (
                                    <div key={order.id} style={{ padding: '1rem', background: 'hsla(45, 93%, 47%, 0.05)', border: '1px solid var(--surface-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{order.productName}</h4>
                                                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                                        <span>{order.quantity || 1} {t(`common.${(order.unit || 'Boxes').toLowerCase()}`)}</span>
                                                        <span>•</span>
                                                        <span>{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--secondary-light)', marginBottom: '0.25rem' }}>
                                                    ₹{order.amount.toLocaleString()}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                                                    <span className={`status-badge small`} style={{ background: order.paymentStatus === 'Paid' ? 'hsla(152, 60%, 40%, 0.1)' : 'hsla(0, 84%, 60%, 0.1)', color: order.paymentStatus === 'Paid' ? 'var(--primary-light)' : 'var(--danger)', borderColor: order.paymentStatus === 'Paid' ? 'hsla(152, 60%, 40%, 0.3)' : 'hsla(0, 84%, 60%, 0.3)' }}>
                                                        {t(`common.${(order.paymentStatus || 'Unpaid').toLowerCase()}`)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                                            {userRole === 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteOrder(order)}
                                                    className="btn"
                                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'hsla(0, 84%, 60%, 0.1)', color: 'var(--danger)', border: '1px solid hsla(0, 84%, 60%, 0.3)' }}
                                                >
                                                    {t('worklist_details.delete')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
                            <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={24} /></button>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <TrendingUp size={24} color="var(--primary-light)" /> {t('worklist_details.record_payment')}
                            </h2>
                            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="input-label">{t('worklist_details.amount_paid')} (₹)</label>
                                    <input required type="number" className="input-field" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} autoFocus />
                                </div>
                                <div>
                                    <label className="input-label">{t('common.notes')} ({t('common.optional')})</label>
                                    <textarea className="input-field" style={{ minHeight: '80px', paddingTop: '0.75rem' }} value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder={t('worklist_details.payment_notes_placeholder')} />
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={isRecordingPayment || paymentAmount <= 0} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        {isRecordingPayment ? <Loader2 className="animate-spin" size={18} /> : t('worklist_details.confirm_payment')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Quick Paid Modal */}
                {quickPaidOrder && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
                            <button onClick={() => setQuickPaidOrder(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={24} /></button>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckSquare size={24} color="var(--primary-light)" /> {t('worklist_details.mark_as_paid')}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                {t('worklist_details.confirm_payment_of')} <strong>₹{quickPaidOrder.amount.toLocaleString()}</strong> {t('common.for')} {quickPaidOrder.productName}.
                            </p>
                            <form onSubmit={handleQuickPaid} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="input-label">{t('worklist_details.payment_remark')} ({t('common.optional')})</label>
                                    <input className="input-field" value={quickPaidRemark} onChange={e => setQuickPaidRemark(e.target.value)} placeholder={t('worklist_details.payment_notes_placeholder')} autoFocus />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('common.confirm')}</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setQuickPaidOrder(null)} style={{ flex: 1 }}>{t('common.cancel')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
