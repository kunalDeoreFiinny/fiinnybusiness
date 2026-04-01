import { useState, useEffect, useRef } from 'react';
import { 
    Save, Loader2, Printer, Search, ShoppingCart, Plus, Minus, Trash2, 
    CreditCard, Banknote, History, ExternalLink, Target, LayoutGrid, List,
    Zap, CheckCircle2, ChevronRight, X, Phone, User, QrCode, Package
} from 'lucide-react';
import UpiQrCode from '../components/UpiQrCode';
import {
    query, onSnapshot, addDoc,
    serverTimestamp, updateDoc,
    runTransaction, getDoc, getDocs, limit, orderBy, where, collection
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { getTenantCollection, getTenantDoc } from '../utils/tenantPath';
import { fetchInvoiceTemplate, fetchInvoiceBranding } from '../services/invoiceTemplateService';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: string;
    name: string;
    maxRetailPrice: number;
    retailerPrice: number;
    sellingPrice: number;
    boxCapacity: number;
    baseUnit: string;
    unit?: string;
    quantity: number;
    loosePieces: number;
    gstPct?: number;
    imageUrl?: string;
    category?: string;
    barcode?: string;
}

interface CartItem extends Product {
    cartQuantity: number;
    cartTotal: number;
}

const CATEGORIES = ['All', 'Kirana', 'Beverages', 'Personal Care', 'Dairy', 'Snacks'];

export default function POSPage() {
    const { tenantId } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // View States
    const [isRetailMode, setIsRetailMode] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const searchRef = useRef<HTMLInputElement>(null);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customer, setCustomer] = useState({
        name: 'Walk-in Customer',
        phone: '',
        address: '',
        pin: ''
    });

    // POS Settings & Branding
    const [branding, setBranding] = useState<any>(null);
    const [nextBillNumber, setNextBillNumber] = useState<string>('');
    const [templateFields, setTemplateFields] = useState<any[]>([]);

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
                    loosePieces: data.loosePieces ?? 0
                } as Product;
            });
            setProducts(productsList);
        });

        const loadSettings = async () => {
            try {
                const [tmpl, brd] = await Promise.all([
                    fetchInvoiceTemplate(tenantId, 'retailer_customer'),
                    fetchInvoiceBranding(tenantId)
                ]);
                setTemplateFields(tmpl.fields.filter(f => f.show).sort((a, b) => a.order - b.order));
                setBranding(brd);

                const counterSnap = await getDoc(getTenantDoc(db, tenantId, 'counters', 'posBillCounter'));
                let currentSeq = counterSnap.exists() ? counterSnap.data().lastBillNumber || 0 : 0;
                setNextBillNumber(`KA-${(currentSeq + 1).toString().padStart(4, '0')}`);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };

        loadSettings();
        return () => unsubProducts();
    }, [tenantId]);

    // Barcode Auto-Focus
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

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id 
                    ? { ...item, cartQuantity: item.cartQuantity + 1, cartTotal: (item.cartQuantity + 1) * (item.sellingPrice || item.maxRetailPrice) }
                    : item
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

    const handlePhoneLookup = async () => {
        if (!tenantId || customer.phone.length < 5) return;
        const q = query(getTenantCollection(db, tenantId, 'retailers'), where('number', '==', customer.phone), limit(1));
        const snaps = await getDocs(q);
        if (!snaps.empty) {
            const data = snaps.docs[0].data();
            setCustomer(prev => ({ ...prev, name: data.name, address: data.atPost, pin: data.pin }));
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

    const handleCheckout = async (paymentMethod: string) => {
        if (!tenantId || cart.length === 0) return;
        setIsProcessing(true);

        try {
            const billNumber = await generateBillNumber();
            const orderData = {
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
                    gstPct: Number(item.gstPct) || 0
                })),
                subtotal: cartSubtotal,
                grandTotal: cartSubtotal,
                paymentStatus: paymentMethod === 'Khata' ? 'Pending' : 'Paid',
                paymentMethod,
                amountPaid: paymentMethod === 'Khata' ? 0 : cartSubtotal,
                status: 'delivered',
                createdAt: serverTimestamp(),
                invoiceDate: new Date().toISOString().split('T')[0]
            };

            await addDoc(getTenantCollection(db, tenantId, 'salesOrders'), orderData);

            // Inventory Sync (Loose pieces deduction)
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
                    updatedAt: serverTimestamp()
                });
            }

            // Optional: Register Customer
            if (customer.phone.length >= 5) {
                const q = query(getTenantCollection(db, tenantId, 'retailers'), where('number', '==', customer.phone), limit(1));
                const snap = await getDocs(q);
                if (snap.empty) {
                    await addDoc(getTenantCollection(db, tenantId, 'retailers'), {
                        name: customer.name, number: customer.phone, atPost: customer.address, pin: customer.pin, status: 'active', createdAt: serverTimestamp()
                    });
                }
            }

            // Print Trigger (Conceptual)
            setIsRetailMode(false);
            setTimeout(() => {
                window.print();
                setCart([]);
                setCustomer({ name: 'Walk-in Customer', phone: '', address: '', pin: '' });
                setIsRetailMode(true);
                setIsProcessing(false);
            }, 500);

        } catch (e) { console.error(e); setIsProcessing(false); }
    };

    const filteredProducts = products.filter(p => 
        (selectedCategory === 'All' || p.category === selectedCategory.toLowerCase()) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode === searchQuery)
    );

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

    return (
        <div style={{ background: 'var(--bg-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header / Search Controls */}
            <header className="no-print" style={{ background: '#fff', borderBottom: '1px solid var(--surface-border)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}><Zap size={24} /></div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>POS Modern</h1>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={20} />
                    <input 
                        ref={searchRef}
                        type="text" 
                        placeholder="Search products or scan barcode (/) ..." 
                        className="input-field" 
                        style={{ paddingLeft: '3rem', borderRadius: '12px' }} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', background: 'var(--surface-raised)', borderRadius: '12px', padding: '0.25rem' }}>
                    <button onClick={() => setIsRetailMode(true)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: isRetailMode ? 'white' : 'transparent', color: isRetailMode ? 'var(--primary)' : 'var(--text-tertiary)', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600 }}>
                        <LayoutGrid size={18} /> Retail
                    </button>
                    <button onClick={() => setIsRetailMode(false)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', background: !isRetailMode ? 'white' : 'transparent', color: !isRetailMode ? 'var(--primary)' : 'var(--text-tertiary)', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600 }}>
                        <List size={18} /> Bill Form
                    </button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                
                {/* Main Content Area */}
                <main className="no-print" style={{ flex: 1, padding: '1.5rem', height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                    {isRetailMode ? (
                        <>
                            {/* Category Filter */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {CATEGORIES.map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{ 
                                            padding: '0.5rem 1.25rem', borderRadius: '20px', whiteSpace: 'nowrap', fontWeight: 600,
                                            background: selectedCategory === cat ? 'var(--primary)' : 'white',
                                            color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                                            border: '1px solid var(--surface-border)', cursor: 'pointer'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Product Grid */}
                            <div className="pos-grid">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="pos-card" onClick={() => addToCart(product)}>
                                        <div className="stock" style={{ background: (product.quantity || 0) > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                                            {(product.quantity || 0)} Box {(product.loosePieces || 0) > 0 ? `+ ${product.loosePieces} ${product.baseUnit}` : ''}
                                        </div>
                                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Package size={32} color="var(--text-tertiary)" />
                                            )}
                                        </div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', height: '2.4rem', overflow: 'hidden', color: 'var(--text-primary)' }}>{product.name}</h4>
                                        <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>₹{product.sellingPrice || product.maxRetailPrice}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ height: '80vh', background: 'white', borderRadius: '12px', padding: '2rem' }}>
                           <p className="text-center text-slate-500 italic">Form-based view (Backwards Compatibility) is currently active for manual entries.</p>
                           {/* Simplified Form representation could go here */}
                        </div>
                    )}
                </main>

                {/* Sidebar Cart */}
                <aside className="no-print" style={{ width: '450px', background: '#fff', borderLeft: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={20} /> Bill Summary</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>#{nextBillNumber}</span>
                        </div>

                        {/* Customer Quick Entry */}
                        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <Phone size={16} color="var(--text-tertiary)" />
                                <input 
                                    type="tel" 
                                    placeholder="Customer Phone No ..." 
                                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    onBlur={handlePhoneLookup}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <User size={16} color="var(--text-tertiary)" />
                                <input 
                                    type="text" 
                                    placeholder="Name: Walk-in Customer" 
                                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontWeight: 600 }}
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Cart Items */}
                        <AnimatePresence>
                            {cart.map(item => (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={item.id} className="pos-cart-item">
                                    <div style={{ flex: 1 }}>
                                        <h5 style={{ fontSize: '0.95rem', margin: 0 }}>{item.name}</h5>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>₹</span>
                                            <input 
                                                type="number"
                                                value={item.sellingPrice || item.maxRetailPrice || 0}
                                                onChange={(e) => {
                                                    const newPrice = Number(e.target.value);
                                                    setCart(prev => prev.map(c => c.id === item.id ? { ...c, sellingPrice: newPrice, cartTotal: c.cartQuantity * newPrice } : c));
                                                }}
                                                style={{ width: '50px', border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', padding: 0 }}
                                            />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>/ {item.unit || item.baseUnit}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-color)', borderRadius: '30px', padding: '0.25rem 0.75rem' }}>
                                        <button onClick={() => updateQty(item.id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem' }}><Minus size={14} /></button>
                                        <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{item.cartQuantity}</span>
                                        <button onClick={() => updateQty(item.id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem' }}><Plus size={14} /></button>
                                    </div>
                                    <div style={{ width: '80px', textAlign: 'right', fontWeight: 700 }}>₹{Math.round(item.cartTotal)}</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {cart.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-tertiary)' }}>
                                <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                <p>Bill is empty.<br/>Select products to start.</p>
                            </div>
                        )}
                    </div>

                    {/* Checkout Footer */}
                    <div style={{ padding: '1.5rem', background: 'var(--surface-raised)', borderTop: '1px solid var(--surface-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 800 }}>
                            <span>To Pay</span>
                            <span style={{ color: 'var(--primary)' }}>₹{Math.round(cartSubtotal).toLocaleString('en-IN')}</span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button onClick={() => handleCheckout('Cash')} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: 'var(--primary)', color: 'white' }}>
                                <Banknote size={20} /> Cash
                            </button>
                            <button onClick={() => handleCheckout('UPI')} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: '#0055ff', color: 'white' }}>
                                <QrCode size={20} /> UPI
                            </button>
                        </div>
                        <button onClick={() => handleCheckout('Khata')} disabled={isProcessing || cart.length === 0} className="btn pos-checkout-btn" style={{ background: 'var(--secondary)', color: 'var(--secondary-dark)' }}>
                             Credit / Digital Khata <ChevronRight size={20} />
                        </button>
                    </div>
                </aside>
            </div>

            {/* Hidden Traditional Print Layout (Credit Memo) */}
            <div className="print-only" style={{ display: 'none' }}>
                <TraditionalPrintLayout 
                    cart={cart} 
                    customer={customer} 
                    branding={branding} 
                    billNumber={nextBillNumber} 
                    subtotal={cartSubtotal}
                />
            </div>
        </div>
    );
}

function TraditionalPrintLayout({ cart, customer, branding, billNumber, subtotal }: any) {
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
                    {/* Fill empty rows for traditional look */}
                    {Array.from({ length: Math.max(0, 10 - cart.length) }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td style={{ border: '1px solid #000', padding: '8px', height: '30px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={4} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Grand Total</td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{Math.round(subtotal)}</td>
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
                        <UpiQrCode upiId={branding.upiId} payeeName={branding.businessName} amount={subtotal} size={80} />
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
