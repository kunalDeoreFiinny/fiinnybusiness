import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Save, Loader2, Printer, Search, ShoppingCart, Plus, Minus, Trash2,
    CreditCard, Banknote, History, ExternalLink, Target, LayoutGrid, List,
    Zap, CheckCircle2, ChevronRight, X, Phone, User, QrCode, Package,
    RotateCcw, Star, Smartphone, Columns, PlusCircle,
} from 'lucide-react';
import UpiQrCode from '../components/UpiQrCode';
import ModuleGate from '../components/ModuleGate';
import {
    query, onSnapshot, addDoc,
    serverTimestamp, updateDoc,
    runTransaction, getDoc, getDocs, limit, orderBy, where, collection, increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { fetchInvoiceTemplate, fetchInvoiceBranding } from '../services/invoiceTemplateService';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Product {
    id: string;
    name: string;
    maxRetailPrice: number;
    retailerPrice: number;
    sellingPrice: number;
    purchasePrice?: number;
    boxCapacity: number;
    baseUnit: string;
    unit?: string;
    quantity: number;
    loosePieces: number;
    gstPct?: number;
    imageUrl?: string;
    category?: string;
    type?: string;
    barcode?: string;
}

interface CartItem extends Product {
    cartQuantity: number;
    cartTotal: number;
}

interface CustomerState {
    name: string;
    phone: string;
    address: string;
    pin: string;
}

interface BillTab {
    id: string;
    label: string;
    cart: CartItem[];
    customer: CustomerState;
}

interface PaymentSplit {
    method: string;
    amount: number;
}

const CATEGORIES = ['All', 'Kirana', 'Beverages', 'Personal Care', 'Dairy', 'Snacks'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Wallet', 'Khata'];
const DENOMINATIONS = [10, 20, 50, 100, 200, 500, 2000];

const defaultCustomer = (): CustomerState => ({
    name: 'Walk-in Customer',
    phone: '',
    address: '',
    pin: '',
});

export default function POSPage() {
    const { t } = useTranslation();
    const { tenantId, hasModule } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // View States
    const [isRetailMode, setIsRetailMode] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const searchRef = useRef<HTMLInputElement>(null);

    // ── Multi-bill tabs ─────────────────────────────────────────────────────
    const [billTabs, setBillTabs] = useState<BillTab[]>([{
        id: 'tab1', label: 'Bill 1', cart: [], customer: defaultCustomer(),
    }]);
    const [activeTabId, setActiveTabId] = useState('tab1');

    const activeTab = billTabs.find(t => t.id === activeTabId) ?? billTabs[0];
    const cart = activeTab.cart;
    const customer = activeTab.customer;

    const updateActiveTab = useCallback((patch: Partial<Pick<BillTab, 'cart' | 'customer'>>) => {
        setBillTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...patch } : t));
    }, [activeTabId]);

    const setCart = (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
        setBillTabs(prev => prev.map(t => {
            if (t.id !== activeTabId) return t;
            const newCart = typeof updater === 'function' ? updater(t.cart) : updater;
            return { ...t, cart: newCart };
        }));
    };

    const setCustomer = (c: CustomerState) => updateActiveTab({ customer: c });

    const addTab = () => {
        if (billTabs.length >= 5) return;
        const newId = `tab${Date.now()}`;
        setBillTabs(prev => [...prev, { id: newId, label: `Bill ${prev.length + 1}`, cart: [], customer: defaultCustomer() }]);
        setActiveTabId(newId);
    };

    const closeTab = (tabId: string) => {
        if (billTabs.length <= 1) return;
        setBillTabs(prev => {
            const next = prev.filter(t => t.id !== tabId);
            if (activeTabId === tabId) setActiveTabId(next[0].id);
            return next;
        });
    };

    // ── POS Settings & Branding ─────────────────────────────────────────────
    const [branding, setBranding] = useState<any>(null);
    const [nextBillNumber, setNextBillNumber] = useState<string>('');
    const [templateFields, setTemplateFields] = useState<any[]>([]);
    const [loyaltyConfig, setLoyaltyConfig] = useState<any>(null);

    // ── Dialog states ────────────────────────────────────────────────────────
    const [showCashTenderDialog, setShowCashTenderDialog] = useState(false);
    const [cashTenderAmount, setCashTenderAmount] = useState<number>(0);

    const [showSplitDialog, setShowSplitDialog] = useState(false);
    const [splits, setSplits] = useState<PaymentSplit[]>([{ method: 'Cash', amount: 0 }]);

    const [showVPayDialog, setShowVPayDialog] = useState(false);

    // ── V-Checkout pending sessions ──────────────────────────────────────────
    const [vcheckoutSessions, setVcheckoutSessions] = useState<any[]>([]);
    const [showVCheckoutPanel, setShowVCheckoutPanel] = useState(false);
    const [vCheckoutSessionUrl, setVCheckoutSessionUrl] = useState('');
    const [showVCheckoutQr, setShowVCheckoutQr] = useState(false);

    // ── Loyalty display ──────────────────────────────────────────────────────
    const [customerLoyalty, setCustomerLoyalty] = useState<any>(null);
    const [redeemPoints, setRedeemPoints] = useState(0);

    useEffect(() => {
        if (!tenantId) return;

        const unsubProducts = onSnapshot(query(getTenantCollection(db, tenantId, 'products')), (snap) => {
            const productsList = snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    quantity: data.quantity ?? (data as any).stock ?? 0,
                    baseUnit: data.baseUnit ?? data.unit ?? 'pcs',
                    loosePieces: data.loosePieces ?? 0,
                    type: data.type || '',
                } as Product;
            });
            setProducts(productsList);
        });

        const loadSettings = async () => {
            try {
                const [tmpl, brd] = await Promise.all([
                    fetchInvoiceTemplate(tenantId, 'retailer_customer'),
                    fetchInvoiceBranding(tenantId),
                ]);
                setTemplateFields(tmpl.fields.filter((f: any) => f.show).sort((a: any, b: any) => a.order - b.order));
                setBranding(brd);

                const counterSnap = await getDoc(getTenantDoc(db, tenantId, 'counters', 'posBillCounter'));
                const currentSeq = counterSnap.exists() ? counterSnap.data().lastBillNumber || 0 : 0;
                setNextBillNumber(`KA-${(currentSeq + 1).toString().padStart(4, '0')}`);

                // Load loyalty config if module is enabled
                if (hasModule('loyalty')) {
                    const loyaltySnap = await getDoc(getTenantDoc(db, tenantId, 'settings', 'loyaltyConfig'));
                    if (loyaltySnap.exists()) setLoyaltyConfig(loyaltySnap.data());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();

        // V-Checkout pending sessions
        let unsubVCheckout: (() => void) | undefined;
        if (hasModule('vcheckout')) {
            unsubVCheckout = onSnapshot(
                query(
                    getTenantCollection(db, tenantId, 'vcheckoutSessions'),
                    where('status', '==', 'submitted'),
                    orderBy('createdAt', 'desc'),
                ),
                (snap) => setVcheckoutSessions(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
            );
        }

        return () => {
            unsubProducts();
            if (unsubVCheckout) unsubVCheckout();
        };
    }, [tenantId, hasModule]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2' || e.key === '/') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.ctrlKey && e.key === 'Enter') handleCheckout('Cash');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart]);

    // Load customer loyalty when phone changes
    useEffect(() => {
        if (!tenantId || !hasModule('loyalty') || customer.phone.length < 5) {
            setCustomerLoyalty(null);
            setRedeemPoints(0);
            return;
        }
        getDoc(getTenantDoc(db, tenantId, 'loyalty', customer.phone))
            .then(snap => { if (snap.exists()) setCustomerLoyalty(snap.data()); else setCustomerLoyalty(null); })
            .catch(() => {});
    }, [customer.phone, tenantId, hasModule]);

    // ── Cart operations ─────────────────────────────────────────────────────
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id
                    ? { ...item, cartQuantity: item.cartQuantity + 1, cartTotal: (item.cartQuantity + 1) * (item.sellingPrice || item.maxRetailPrice) }
                    : item,
                );
            }
            const rate = product.sellingPrice || product.retailerPrice || product.maxRetailPrice || 0;
            return [...prev, { ...product, cartQuantity: 1, cartTotal: rate }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.cartQuantity + delta);
                const rate = item.sellingPrice || item.maxRetailPrice || 0;
                return { ...item, cartQuantity: newQty, cartTotal: newQty * rate };
            }
            return item;
        }).filter(item => item.cartQuantity > 0));
    };

    const cartSubtotal = cart.reduce((sum, item) => sum + item.cartTotal, 0);
    const loyaltyDiscount = redeemPoints * ((loyaltyConfig?.pointsValue) || 0.1);
    const grandTotal = Math.max(0, cartSubtotal - loyaltyDiscount);

    const handlePhoneLookup = async () => {
        if (!tenantId || customer.phone.length < 5) return;
        const q = query(getTenantCollection(db, tenantId, 'retailers'), where('number', '==', customer.phone), limit(1));
        const snaps = await getDocs(q);
        if (!snaps.empty) {
            const data = snaps.docs[0].data();
            setCustomer({ ...customer, name: data.name, address: data.atPost, pin: data.pin });
        }
    };

    const generateBillNumber = async (): Promise<string> => {
        if (!tenantId) return `POS-${Date.now().toString().slice(-6)}`;
        const counterRef = getTenantDoc(db, tenantId, 'counters', 'posBillCounter');
        let newSeq = 1;
        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(counterRef);
            newSeq = docSnap.exists() ? (docSnap.data().lastBillNumber || 0) + 1 : 1;
            transaction.set(counterRef, { lastBillNumber: newSeq }, { merge: true });
        });
        return `KA-${newSeq.toString().padStart(4, '0')}`;
    };

    const handleCheckout = async (
        paymentMethod: string,
        options?: {
            cashReceived?: number;
            splits?: PaymentSplit[];
            loyaltyPointsRedeemed?: number;
        },
    ) => {
        if (!tenantId || cart.length === 0) return;
        setIsProcessing(true);

        try {
            const billNumber = await generateBillNumber();
            const orderData: any = {
                orderNumber: billNumber,
                retailerName: customer.name || 'Walk-in Customer',
                phoneNumber: customer.phone,
                address: customer.address,
                pin: customer.pin,
                lineItems: cart.map(item => ({
                    productId: item.id || '',
                    productName: item.name || 'Unknown Product',
                    quantity: Number(item.cartQuantity) || 0,
                    unit: item.unit || item.baseUnit || 'pcs',
                    mrp: Number(item.sellingPrice || item.maxRetailPrice) || 0,
                    amount: Number(item.cartTotal) || 0,
                    gstPct: Number(item.gstPct) || 0,
                })),
                subtotal: cartSubtotal,
                discount: loyaltyDiscount,
                grandTotal,
                paymentStatus: paymentMethod === 'Khata' ? 'Pending' : 'Paid',
                paymentMethod,
                paymentSplits: options?.splits ?? [],
                cashReceived: options?.cashReceived,
                changeGiven: options?.cashReceived ? Math.max(0, options.cashReceived - grandTotal) : 0,
                loyaltyPointsRedeemed: options?.loyaltyPointsRedeemed ?? redeemPoints,
                amountPaid: paymentMethod === 'Khata' ? 0 : grandTotal,
                status: 'delivered',
                createdAt: serverTimestamp(),
                invoiceDate: new Date().toISOString().split('T')[0],
            };

            await addDoc(getTenantCollection(db, tenantId, 'salesOrders'), orderData);

            // Inventory deduction
            for (const item of cart) {
                const productRef = getTenantDoc(db, tenantId, 'products', item.id);
                const q = item.cartQuantity;
                let newLoose = (item.loosePieces || 0) - q;
                let newBoxes = item.quantity || 0;
                while (newLoose < 0 && newBoxes > 0) {
                    newBoxes -= 1;
                    newLoose += (item.boxCapacity || 1);
                }
                await updateDoc(productRef, {
                    quantity: newBoxes >= 0 ? newBoxes : 0,
                    loosePieces: newBoxes >= 0 ? newLoose : 0,
                    updatedAt: serverTimestamp(),
                });
            }

            // Register customer if new
            if (customer.phone.length >= 5) {
                const q = query(getTenantCollection(db, tenantId, 'retailers'), where('number', '==', customer.phone), limit(1));
                const snap = await getDocs(q);
                if (snap.empty) {
                    await addDoc(getTenantCollection(db, tenantId, 'retailers'), {
                        name: customer.name, number: customer.phone, atPost: customer.address,
                        pin: customer.pin, status: 'active', createdAt: serverTimestamp(),
                    });
                }
            }

            // Loyalty points accumulation
            if (hasModule('loyalty') && customer.phone.length >= 5 && loyaltyConfig) {
                const loyaltyRef = getTenantDoc(db, tenantId, 'loyalty', customer.phone);
                const pointsPerRupee = loyaltyConfig.pointsPerRupee || 10;
                const pointsEarned = Math.floor(grandTotal / pointsPerRupee);
                const redeemed = options?.loyaltyPointsRedeemed ?? redeemPoints;
                await runTransaction(db, async (tx) => {
                    const snap = await tx.get(loyaltyRef);
                    const cur = snap.exists() ? snap.data() : { points: 0, totalSpend: 0 };
                    tx.set(loyaltyRef, {
                        phone: customer.phone,
                        customerName: customer.name,
                        points: Math.max(0, (cur.points || 0) + pointsEarned - redeemed),
                        totalSpend: (cur.totalSpend || 0) + grandTotal,
                        lastActivity: serverTimestamp(),
                    }, { merge: true });
                });
            }

            // Print and reset
            setIsRetailMode(false);
            setTimeout(() => {
                window.print();
                // Reset the active tab
                setBillTabs(prev => prev.map(t =>
                    t.id === activeTabId
                        ? { ...t, cart: [], customer: defaultCustomer() }
                        : t,
                ));
                setRedeemPoints(0);
                setIsRetailMode(true);
                setIsProcessing(false);
            }, 500);

        } catch (e) {
            console.error(e);
            setIsProcessing(false);
        }
    };

    // Accept a V-Checkout session into the active tab
    const acceptVCheckoutSession = async (session: any) => {
        if (!tenantId) return;
        // Load session cart items as CartItem[]
        const items: CartItem[] = (session.cart || []).map((ci: any) => {
            const prod = products.find(p => p.id === ci.productId);
            if (!prod) return null;
            return { ...prod, cartQuantity: ci.quantity, cartTotal: ci.quantity * (ci.price || prod.sellingPrice || prod.maxRetailPrice) };
        }).filter(Boolean);

        updateActiveTab({ cart: items });
        setShowVCheckoutPanel(false);

        // Mark session as confirmed
        await updateDoc(getTenantDoc(db, tenantId, 'vcheckoutSessions', session.id), {
            status: 'confirmed', updatedAt: serverTimestamp(),
        });
    };

    // Create a V-Checkout session QR
    const handleCreateVCheckoutSession = async () => {
        if (!tenantId) return;
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await addDoc(getTenantCollection(db, tenantId, 'vcheckoutSessions'), {
            tenantId, status: 'open', cart: [], qrToken: token,
            createdAt: serverTimestamp(),
            expiresAt,
        });
        setVCheckoutSessionUrl(`${window.location.origin}/v-checkout/${tenantId}/${token}`);
        setShowVCheckoutQr(true);
    };

    const realProductsExist = products.some(p => p.purchasePrice !== 0 || !(p as any).sku?.startsWith('SKU-'));
    const filteredProducts = products.filter(p => {
        const isDummy = p.purchasePrice === 0 && (p as any).sku?.startsWith('SKU-');
        if (realProductsExist && isDummy) return false;
        return (selectedCategory === 'All' || (p.type || '').toLowerCase() === selectedCategory.toLowerCase()) &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode === searchQuery);
    });

    // Split payment helpers
    const splitTotal = splits.reduce((s, sp) => s + (Number(sp.amount) || 0), 0);
    const splitRemaining = grandTotal - splitTotal;

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <header className="no-print" style={{ background: '#fff', borderBottom: '1px solid var(--surface-border)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}><Zap size={22} /></div>
                    <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>POS Billing</h1>
                </div>

                <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={18} />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search or scan barcode (/) ..."
                        className="input-field"
                        style={{ paddingLeft: '2.75rem', borderRadius: '12px', fontSize: '0.9rem' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Returns quick access */}
                <ModuleGate moduleId="returns_exchanges" moduleName="Returns" paywallVariant="badge">
                    <Link to="/returns" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'white', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                        <RotateCcw size={16} /> Returns
                    </Link>
                </ModuleGate>

                {/* V-Checkout session QR */}
                <ModuleGate moduleId="vcheckout" moduleName="V-Checkout" paywallVariant="badge">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={handleCreateVCheckoutSession} title="Generate customer self-scan QR"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <Smartphone size={16} /> V-Checkout
                        </button>
                        {vcheckoutSessions.length > 0 && (
                            <button onClick={() => setShowVCheckoutPanel(true)}
                                style={{ position: 'relative', padding: '0.45rem 0.75rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                                <Smartphone size={16} />
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                    {vcheckoutSessions.length}
                                </span>
                            </button>
                        )}
                    </div>
                </ModuleGate>

                <div style={{ display: 'flex', background: 'var(--surface-raised)', borderRadius: '12px', padding: '0.2rem' }}>
                    <button onClick={() => setIsRetailMode(true)} style={{ padding: '0.4rem 0.9rem', borderRadius: '10px', background: isRetailMode ? 'white' : 'transparent', color: isRetailMode ? 'var(--primary)' : 'var(--text-tertiary)', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.4rem', alignItems: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                        <LayoutGrid size={16} /> Retail
                    </button>
                    <button onClick={() => setIsRetailMode(false)} style={{ padding: '0.4rem 0.9rem', borderRadius: '10px', background: !isRetailMode ? 'white' : 'transparent', color: !isRetailMode ? 'var(--primary)' : 'var(--text-tertiary)', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.4rem', alignItems: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                        <List size={16} /> Form
                    </button>
                </div>
            </header>

            {/* Multi-bill tabs bar */}
            <ModuleGate moduleId="multi_bill_tabs" moduleName="Multiple Bills" paywallVariant="badge">
                <div className="no-print" style={{ background: 'white', borderBottom: '1px solid var(--surface-border)', padding: '0.5rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', overflowX: 'auto' }}>
                    {billTabs.map(tab => (
                        <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button
                                onClick={() => setActiveTabId(tab.id)}
                                style={{
                                    padding: '0.35rem 0.9rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', border: '1px solid',
                                    background: tab.id === activeTabId ? 'var(--primary)' : 'white',
                                    color: tab.id === activeTabId ? 'white' : 'var(--text-secondary)',
                                    borderColor: tab.id === activeTabId ? 'var(--primary)' : 'var(--surface-border)',
                                    cursor: 'pointer',
                                }}>
                                {tab.label} {tab.cart.length > 0 && <span style={{ opacity: 0.7 }}>({tab.cart.length})</span>}
                            </button>
                            {billTabs.length > 1 && (
                                <button onClick={() => closeTab(tab.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-tertiary)', borderRadius: '4px' }}>
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                    {billTabs.length < 5 && (
                        <button onClick={addTab} style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px dashed var(--surface-border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
                            <PlusCircle size={14} /> New Bill
                        </button>
                    )}
                </div>
            </ModuleGate>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Main product area */}
                <main className="no-print" style={{ flex: 1, padding: '1.25rem', height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                    {isRetailMode ? (
                        <>
                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                {CATEGORIES.map(cat => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            padding: '0.4rem 1.1rem', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: 600,
                                            background: selectedCategory === cat ? 'var(--primary)' : 'white',
                                            color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                                            border: '1px solid var(--surface-border)', cursor: 'pointer', fontSize: '0.875rem',
                                        }}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="pos-grid">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="pos-card" onClick={() => addToCart(product)}>
                                        <div className="stock" style={{ background: (product.quantity || 0) > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                                            {product.quantity || 0} Box {(product.loosePieces || 0) > 0 ? `+ ${product.loosePieces} ${product.baseUnit}` : ''}
                                        </div>
                                        <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '0.6rem', overflow: 'hidden' }}>
                                            {product.imageUrl
                                                ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <Package size={30} color="var(--text-tertiary)" />
                                            }
                                        </div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.2rem', height: '2.2rem', overflow: 'hidden', color: 'var(--text-primary)' }}>{product.name}</h4>
                                        <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem', margin: 0 }}>₹{product.sellingPrice || product.maxRetailPrice}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem' }}>
                            <p className="text-center text-slate-500 italic">Form-based entry view — use the Retail tab to scan and add products.</p>
                        </div>
                    )}
                </main>

                {/* Cart sidebar */}
                <aside className="no-print" style={{ width: '420px', background: '#fff', borderLeft: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><ShoppingCart size={18} /> Bill Summary</h3>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>#{nextBillNumber}</span>
                        </div>

                        {/* Customer entry */}
                        <div className="glass-panel" style={{ padding: '0.875rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                <Phone size={15} color="var(--text-tertiary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <input
                                    type="tel"
                                    placeholder="Customer phone..."
                                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem' }}
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    onBlur={handlePhoneLookup}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <User size={15} color="var(--text-tertiary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    placeholder="Name: Walk-in Customer"
                                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Loyalty points display */}
                        {hasModule('loyalty') && customerLoyalty && customerLoyalty.points > 0 && (
                            <div style={{ background: 'hsla(45,93%,47%,0.08)', border: '1px solid hsla(45,93%,47%,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Star size={16} color="#d97706" />
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{customerLoyalty.points} points available</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        min={0}
                                        max={customerLoyalty.points}
                                        value={redeemPoints}
                                        onChange={e => setRedeemPoints(Math.min(Number(e.target.value), customerLoyalty.points))}
                                        style={{ width: '60px', border: '1px solid var(--surface-border)', borderRadius: '6px', padding: '0.2rem 0.4rem', fontSize: '0.85rem' }}
                                    />
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>pts</span>
                                </div>
                            </div>
                        )}

                        {/* Cart items */}
                        <AnimatePresence>
                            {cart.map(item => (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={item.id} className="pos-cart-item">
                                    <div style={{ flex: 1 }}>
                                        <h5 style={{ fontSize: '0.9rem', margin: 0 }}>{item.name}</h5>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>₹</span>
                                            <input
                                                type="number"
                                                value={item.sellingPrice || item.maxRetailPrice || 0}
                                                onChange={(e) => {
                                                    const newPrice = Number(e.target.value);
                                                    setCart(prev => prev.map(c => c.id === item.id ? { ...c, sellingPrice: newPrice, cartTotal: c.cartQuantity * newPrice } : c));
                                                }}
                                                style={{ width: '52px', border: 'none', background: 'transparent', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', padding: 0 }}
                                            />
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>/ {item.unit || item.baseUnit}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-color)', borderRadius: '30px', padding: '0.2rem 0.6rem' }}>
                                        <button onClick={() => updateQty(item.id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem' }}><Minus size={13} /></button>
                                        <span style={{ fontWeight: 800, minWidth: '18px', textAlign: 'center', fontSize: '0.9rem' }}>{item.cartQuantity}</span>
                                        <button onClick={() => updateQty(item.id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem' }}><Plus size={13} /></button>
                                    </div>
                                    <div style={{ width: '72px', textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>₹{Math.round(item.cartTotal)}</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {cart.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-tertiary)' }}>
                                <ShoppingCart size={44} style={{ margin: '0 auto 1rem', opacity: 0.15 }} />
                                <p>Bill is empty.<br />Select products to start.</p>
                            </div>
                        )}
                    </div>

                    {/* Checkout footer */}
                    <div style={{ padding: '1.25rem', background: 'var(--surface-raised)', borderTop: '1px solid var(--surface-border)' }}>
                        {/* Totals */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            {loyaltyDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    <span>Subtotal</span><span>₹{Math.round(cartSubtotal)}</span>
                                </div>
                            )}
                            {loyaltyDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a', marginBottom: '0.25rem' }}>
                                    <span>Loyalty Discount ({redeemPoints} pts)</span><span>-₹{loyaltyDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                                <span>To Pay</span>
                                <span style={{ color: 'var(--primary)' }}>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Payment buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                            {/* Cash */}
                            <button onClick={() => handleCheckout('Cash')} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: 'var(--primary)', color: 'white' }}>
                                <Banknote size={18} /> Cash
                            </button>

                            {/* V Pay (UPI QR) */}
                            <ModuleGate moduleId="vpay" moduleName="V Pay" paywallVariant="badge">
                                <button onClick={() => setShowVPayDialog(true)} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: '#0055ff', color: 'white', width: '100%' }}>
                                    <QrCode size={18} /> V Pay
                                </button>
                            </ModuleGate>

                            {/* Cash Tender */}
                            <ModuleGate moduleId="cash_tender" moduleName="Cash Tender" paywallVariant="badge">
                                <button onClick={() => { setCashTenderAmount(grandTotal); setShowCashTenderDialog(true); }} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: '#16a34a', color: 'white', width: '100%' }}>
                                    <Banknote size={18} /> Cash+Change
                                </button>
                            </ModuleGate>

                            {/* Split Payment */}
                            <ModuleGate moduleId="multiple_payment_modes" moduleName="Split Payment" paywallVariant="badge">
                                <button onClick={() => { setSplits([{ method: 'Cash', amount: grandTotal }]); setShowSplitDialog(true); }} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: '#7c3aed', color: 'white', width: '100%' }}>
                                    <CreditCard size={18} /> Split
                                </button>
                            </ModuleGate>
                        </div>

                        {/* Khata (full width) */}
                        <button onClick={() => handleCheckout('Khata')} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: 'var(--secondary)', color: 'var(--secondary-dark)', width: '100%' }}>
                            Credit / Digital Khata <ChevronRight size={18} />
                        </button>
                    </div>
                </aside>
            </div>

            {/* ── V-Pay Dialog ──────────────────────────────────────────────────────── */}
            {showVPayDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={() => setShowVPayDialog(false)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '340px', width: '100%', textAlign: 'center' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1rem' }}>Scan to Pay</h3>
                        <UpiQrCode
                            upiId={branding?.upiId || ''}
                            payeeName={branding?.businessName || 'Store'}
                            amount={grandTotal}
                            size={200}
                        />
                        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', margin: '1rem 0 0.5rem' }}>
                            ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>Bill #{nextBillNumber}</p>
                        <button onClick={() => { setShowVPayDialog(false); handleCheckout('UPI'); }}
                            className="btn" style={{ background: 'var(--primary)', color: 'white', width: '100%', marginBottom: '0.5rem' }}>
                            <CheckCircle2 size={18} /> Mark as Paid
                        </button>
                        <button onClick={() => setShowVPayDialog(false)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', width: '100%', padding: '0.5rem' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ── Cash Tender Dialog ────────────────────────────────────────────────── */}
            {showCashTenderDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={() => setShowCashTenderDialog(false)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '380px', width: '100%' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0 }}>Cash Tender</h3>
                            <button onClick={() => setShowCashTenderDialog(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ background: 'var(--surface-raised)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bill Total</p>
                            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>₹{Math.round(grandTotal).toLocaleString('en-IN')}</p>
                        </div>

                        <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Quick denominations</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {DENOMINATIONS.map(d => (
                                <button key={d} onClick={() => setCashTenderAmount(d)}
                                    style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: cashTenderAmount === d ? 'var(--primary)' : 'white', color: cashTenderAmount === d ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                    ₹{d}
                                </button>
                            ))}
                            <button onClick={() => setCashTenderAmount(grandTotal)}
                                style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: cashTenderAmount === grandTotal ? 'var(--primary)' : 'white', color: cashTenderAmount === grandTotal ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                Exact
                            </button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', display: 'block' }}>Cash Received</label>
                            <input
                                type="number"
                                value={cashTenderAmount || ''}
                                onChange={e => setCashTenderAmount(Number(e.target.value))}
                                placeholder="Enter amount"
                                className="input-field"
                                style={{ fontSize: '1.1rem', fontWeight: 700 }}
                                autoFocus
                            />
                        </div>

                        {cashTenderAmount > 0 && (
                            <div style={{ background: cashTenderAmount >= grandTotal ? '#dcfce7' : '#fee2e2', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontWeight: 700, color: cashTenderAmount >= grandTotal ? '#16a34a' : '#dc2626' }}>
                                    {cashTenderAmount >= grandTotal
                                        ? `Change: ₹${Math.round(cashTenderAmount - grandTotal)}`
                                        : `Short by ₹${Math.round(grandTotal - cashTenderAmount)}`}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => { setShowCashTenderDialog(false); handleCheckout('Cash', { cashReceived: cashTenderAmount }); }}
                            disabled={cashTenderAmount < grandTotal || isProcessing}
                            className="btn"
                            style={{ background: 'var(--primary)', color: 'white', width: '100%', opacity: cashTenderAmount < grandTotal ? 0.5 : 1 }}>
                            <CheckCircle2 size={18} /> Complete Sale
                        </button>
                    </div>
                </div>
            )}

            {/* ── Split Payment Dialog ──────────────────────────────────────────────── */}
            {showSplitDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={() => setShowSplitDialog(false)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '100%' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0 }}>Split Payment</h3>
                            <button onClick={() => setShowSplitDialog(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ background: 'var(--surface-raised)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bill Total</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.15rem' }}>₹{Math.round(grandTotal)}</span>
                        </div>

                        {splits.map((sp, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', alignItems: 'center' }}>
                                <select value={sp.method} onChange={e => setSplits(prev => prev.map((s, idx) => idx === i ? { ...s, method: e.target.value } : s))}
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '0.9rem' }}>
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <input type="number" value={sp.amount || ''} onChange={e => setSplits(prev => prev.map((s, idx) => idx === i ? { ...s, amount: Number(e.target.value) } : s))}
                                    placeholder="₹0"
                                    style={{ width: '90px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--surface-border)', fontSize: '0.9rem', fontWeight: 700 }} />
                                {splits.length > 1 && (
                                    <button onClick={() => setSplits(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {splits.length < 4 && (
                            <button onClick={() => setSplits(prev => [...prev, { method: 'UPI', amount: 0 }])}
                                style={{ background: 'transparent', border: '1px dashed var(--surface-border)', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <Plus size={14} /> Add Payment Mode
                            </button>
                        )}

                        <div style={{ background: splitRemaining === 0 ? '#dcfce7' : splitRemaining < 0 ? '#fee2e2' : 'var(--surface-raised)', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Remaining</span>
                            <span style={{ fontWeight: 800, color: splitRemaining === 0 ? '#16a34a' : splitRemaining < 0 ? '#dc2626' : 'var(--text-primary)' }}>
                                ₹{Math.round(Math.abs(splitRemaining))} {splitRemaining < 0 ? '(over)' : ''}
                            </span>
                        </div>

                        <button
                            onClick={() => { setShowSplitDialog(false); handleCheckout('Split', { splits }); }}
                            disabled={Math.abs(splitRemaining) > 0.5 || isProcessing}
                            className="btn"
                            style={{ background: 'var(--primary)', color: 'white', width: '100%', opacity: Math.abs(splitRemaining) > 0.5 ? 0.5 : 1 }}>
                            <CheckCircle2 size={18} /> Confirm Payment
                        </button>
                    </div>
                </div>
            )}

            {/* ── V-Checkout Pending Sessions Panel ────────────────────────────────── */}
            {showVCheckoutPanel && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}
                    onClick={() => setShowVCheckoutPanel(false)}>
                    <div style={{ width: '380px', background: 'white', height: '100%', overflowY: 'auto', padding: '1.5rem' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Smartphone size={20} /> Pending V-Checkouts
                            </h3>
                            <button onClick={() => setShowVCheckoutPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        {vcheckoutSessions.length === 0
                            ? <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>No pending sessions</p>
                            : vcheckoutSessions.map(session => (
                                <div key={session.id} style={{ background: 'var(--surface-raised)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600 }}>{session.cart?.length || 0} items</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Math.round(session.grandTotal || 0)}</span>
                                    </div>
                                    {session.cart?.slice(0, 3).map((ci: any, i: number) => (
                                        <p key={i} style={{ margin: '0 0 2px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {ci.productName} × {ci.quantity}
                                        </p>
                                    ))}
                                    {(session.cart?.length || 0) > 3 && <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: 0 }}>+{session.cart.length - 3} more</p>}
                                    <button onClick={() => acceptVCheckoutSession(session)}
                                        style={{ marginTop: '0.75rem', width: '100%', padding: '0.4rem', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                                        Accept → Load to Bill
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* ── V-Checkout QR Dialog ─────────────────────────────────────────────── */}
            {showVCheckoutQr && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={() => setShowVCheckoutQr(false)}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '340px', width: '100%', textAlign: 'center' }}
                        onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Customer Self-Scan</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                            Customer scans this QR to browse and add items from their phone
                        </p>
                        <UpiQrCode upiId={vCheckoutSessionUrl} payeeName="" amount={0} size={200} />
                        <p style={{ fontSize: '0.7rem', wordBreak: 'break-all', color: 'var(--text-tertiary)', margin: '0.75rem 0' }}>{vCheckoutSessionUrl}</p>
                        <button onClick={() => setShowVCheckoutQr(false)} className="btn" style={{ background: 'var(--primary)', color: 'white', width: '100%' }}>
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden print layout */}
            <div className="print-only">
                <TraditionalPrintLayout
                    cart={cart}
                    customer={customer}
                    branding={branding}
                    billNumber={nextBillNumber}
                    subtotal={cartSubtotal}
                    discount={loyaltyDiscount}
                    grandTotal={grandTotal}
                />
            </div>
        </div>
    );
}

function TraditionalPrintLayout({ cart, customer, branding, billNumber, subtotal, discount, grandTotal }: any) {
    return (
        <div style={{ padding: '20mm', fontFamily: 'serif', background: '#fff', color: '#000' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '24px' }}>Credit Memo</h3>
                <h1 style={{ margin: '5px 0', fontSize: '32px' }}>{branding?.businessName || 'Karan Arjun Retailer OS'}</h1>
                <p style={{ margin: 0 }}>{branding?.address} {branding?.licenseNumbers ? `| Lic: ${branding.licenseNumbers}` : ''}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' }}>
                <div>
                    <h4 style={{ borderBottom: '1px solid #000', paddingBottom: '5px' }}>Billed To:</h4>
                    <p><strong>{customer.name}</strong></p>
                    <p>{customer.phone}</p>
                    <p>{customer.address}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p><strong>Invoice #:</strong> {billNumber}</p>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ background: '#eee' }}>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Sr</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Item Description</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Qty</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Rate</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item: any, i: number) => (
                        <tr key={i}>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{item.name}</td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item.cartQuantity} {item.baseUnit}</td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>₹{item.sellingPrice || item.maxRetailPrice}</td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>₹{Math.round(item.cartTotal)}</td>
                        </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 8 - cart.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td style={{ border: '1px solid #000', padding: '8px', height: '28px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    {discount > 0 && (
                        <tr>
                            <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Loyalty Discount</td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', color: 'green' }}>-₹{Math.round(discount)}</td>
                        </tr>
                    )}
                    <tr>
                        <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{Math.round(grandTotal)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div style={{ textAlign: 'center', width: '150px' }}>
                    <div style={{ height: '40px', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
                    <p>Customer Signature</p>
                </div>
                {branding?.upiId && (
                    <div style={{ textAlign: 'center' }}>
                        <UpiQrCode upiId={branding.upiId} payeeName={branding.businessName} amount={grandTotal} size={80} />
                        <p style={{ fontSize: '10px', marginTop: '5px' }}>Scan to Pay</p>
                    </div>
                )}
                <div style={{ textAlign: 'center', width: '150px' }}>
                    <div style={{ height: '40px', borderBottom: '1px solid #000', marginBottom: '5px' }}></div>
                    <p>Authorised Signatory</p>
                </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '30px', color: '#666' }}>
                Computer Generated Invoice - No Signature Required
            </p>
        </div>
    );
}
