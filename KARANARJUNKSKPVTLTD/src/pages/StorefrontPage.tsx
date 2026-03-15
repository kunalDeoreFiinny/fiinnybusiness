import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingBag, ChevronRight, CheckCircle2, MapPin, Truck, AlertCircle, Phone, User as UserIcon, Lock, Image as ImageIcon, Store } from 'lucide-react';
import type { StoreProduct } from './AdminStoreProductsPage';
import { useAuth } from '../contexts/AuthContext';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function StorefrontPage() {
    const { tenantId: authTenantId } = useAuth();
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
    const [checkoutStep, setCheckoutStep] = useState<'browse' | 'phone' | 'details' | 'payment' | 'success'>('browse');
    
    // Checkout State
    const [phone, setPhone] = useState('');
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        address: '',
        pincode: ''
    });
    
    // Derived State
    const deliveryCharge = customerDetails.pincode ? (customerDetails.pincode.startsWith('40') || customerDetails.pincode.startsWith('41') || customerDetails.pincode.startsWith('42') || customerDetails.pincode.startsWith('43') || customerDetails.pincode.startsWith('44') ? 300 : 450) : 0;
    const orderTotal = selectedProduct ? (selectedProduct.price + (selectedProduct.price * selectedProduct.gstPct / 100)) + deliveryCharge : 0;

    // Resolve the tenant ID to use for the store
    useEffect(() => {
        if (authTenantId) {
            // If admin or logged-in user — use their tenant directly
            setTenantId(authTenantId);
        } else {
            // For public/anonymous visitors — try to find the tenant from a global config
            const resolvePublicTenant = async () => {
                try {
                    // Fallback: try fetching the first tenant from a publicConfig doc
                    const configDoc = await getDoc(doc(db, 'publicConfig', 'storefront'));
                    if (configDoc.exists()) {
                        setTenantId(configDoc.data().tenantId);
                    } else {
                        setLoading(false); // No config found, show empty
                    }
                } catch (e) {
                    console.error('Failed to resolve public tenant', e);
                    setLoading(false);
                }
            };
            resolvePublicTenant();
        }
    }, [authTenantId]);

    useEffect(() => {
        if (!tenantId) return;
        const fetchPublicProducts = async () => {
            try {
                const q = query(
                    collection(db, `tenants/${tenantId}/storeProducts`),
                    where('isAvailable', '==', true)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoreProduct[];
                setProducts(data);
            } catch (error) {
                console.error("Failed to load store products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProducts();
    }, [tenantId]);

    const handleBuyNow = (product: StoreProduct) => {
        setSelectedProduct(product);
        setCheckoutStep('phone');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) return alert("Please enter a valid phone number");
        
        // TODO: Later hook this up to check if user exists in retailers or salesOrders and autofill
        
        setCheckoutStep('details');
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerDetails.name || !customerDetails.address || !customerDetails.pincode) {
            return alert("Please fill all delivery fields");
        }
        setCheckoutStep('payment');
    };

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const options = {
            key: "rzp_test_SPps7iw6mF8ytB", // Test Key provided by user
            amount: Math.round(orderTotal * 100), // convert to paise
            currency: "INR",
            name: "KaranArjun",
            description: "Store Purchase",
            handler: async function (response: any) {
                // Payment succeeded!
                try {
                    const orderData = {
                        customerName: customerDetails.name,
                        phoneNumber: phone,
                        alternatePhone: '',
                        address: customerDetails.address + ', PIN: ' + customerDetails.pincode,
                        products: [{
                            productName: selectedProduct?.productName || 'Unknown Product',
                            quantity: 1,
                            unitPrice: selectedProduct?.price || 0,
                            discount: 0,
                            taxRate: selectedProduct?.gstPct || 0,
                            subTotal: (selectedProduct?.price || 0) + (((selectedProduct?.price || 0) * (selectedProduct?.gstPct || 0)) / 100) 
                        }],
                        amount: orderTotal,
                        paymentStatus: 'Paid',
                        paymentMethod: 'Razorpay',
                        razorpayPaymentId: response.razorpay_payment_id,
                        paymentDate: new Date().toLocaleDateString('en-GB'),
                        paymentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        packageWeight: '',
                        packageLength: '',
                        packageWidth: '',
                        packageHeight: '',
                        courierSent: 'No',
                        courierSendDate: '',
                        remarks: 'E-commerce Order (Razorpay)',
                        gstTotal: (selectedProduct?.price || 0) * (selectedProduct?.gstPct || 0) / 100,
                        finalTotal: orderTotal,
                        source: 'Website',
                        createdAt: new Date()
                    };

                    await addDoc(collection(db, `tenants/${tenantId}/onlineOrders`), {
                        ...orderData,
                        createdAt: serverTimestamp()
                    });

                    setCheckoutStep('success');
                } catch (err) {
                    console.error("Failed to save order", err);
                    alert("Payment successful, but failed to save order details. Please contact support.");
                }
            },
            prefill: {
                name: customerDetails.name,
                contact: phone,
            },
            theme: {
                color: "#16a34a", // Match KaranArjun theme primary green
            }
        };
        
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
             alert(`Payment failed: ${response.error.description}`);
        });
        paymentObject.open();
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'transparent', borderRadius: '50%' }} />
            </div>
        );
    }

    if (checkoutStep === 'success') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                <div className="glass-panel animate-fade-in" style={{ maxWidth: '500px', width: '90%', padding: '4rem 2rem', textAlign: 'center' }}>
                    <CheckCircle2 size={80} style={{ color: '#22c55e', margin: '0 auto 1.5rem' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Order Confirmed!</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Thank you for shopping with KaranArjun. Your order for <strong>{selectedProduct?.productName}</strong> has been successfully placed.
                    </p>
                    <div style={{ background: 'var(--surface-raised)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Delivery Details</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customerDetails.name}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>+91 {phone}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{customerDetails.address}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>PIN: {customerDetails.pincode}</div>
                    </div>
                    <button onClick={() => { setCheckoutStep('browse'); setSelectedProduct(null); }} className="btn btn-primary" style={{ width: '100%' }}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Minimalist Public Header */}
            <header style={{ background: 'var(--surface-base)', padding: '1rem 2rem', borderBottom: '1px solid var(--surface-border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="primary-gradient-text" style={{ fontSize: '1.5rem', letterSpacing: '-0.03em', margin: 0 }}>
                        KaranArjun
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <ShoppingBag size={20} /> Store
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
                
                {/* Checkout Flow Area */}
                {checkoutStep !== 'browse' && selectedProduct && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '2rem', alignItems: 'start' }}>
                        
                        {/* Left Column: Form Steps */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                                <button onClick={() => setCheckoutStep('browse')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}>
                                    ← Back
                                </button>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Secure Checkout</h2>
                            </div>

                            {/* Step 1: Phone */}
                            {checkoutStep === 'phone' && (
                                <form onSubmit={handlePhoneSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>Enter Mobile Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                            <input 
                                                type="tel" 
                                                className="input-field" 
                                                style={{ paddingLeft: '3rem', fontSize: '1.1rem', height: '3.5rem' }}
                                                placeholder="9876543210" 
                                                value={phone} 
                                                onChange={(e) => setPhone(e.target.value)}
                                                autoFocus
                                                required 
                                                maxLength={10}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>We'll use this to send order updates.</p>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ height: '3.5rem', fontSize: '1.1rem' }}>
                                        Continue <ChevronRight size={20} />
                                    </button>
                                </form>
                            )}

                            {/* Step 2: Delivery Details */}
                            {checkoutStep === 'details' && (
                                <form onSubmit={handleDetailsSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={20} style={{ color: 'var(--primary-light)' }} /> Delivery Address
                                    </h3>
                                    
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                            <input type="text" className="input-field" style={{ paddingLeft: '2.5rem' }} value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} required placeholder="John Doe" />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Pincode</label>
                                        <input type="text" className="input-field" value={customerDetails.pincode} onChange={e => setCustomerDetails({...customerDetails, pincode: e.target.value})} required maxLength={6} placeholder="400001" />
                                        {customerDetails.pincode.length >= 2 && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--primary-light)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Truck size={14} /> 
                                                {customerDetails.pincode.startsWith('40') || customerDetails.pincode.startsWith('41') || customerDetails.pincode.startsWith('42') || customerDetails.pincode.startsWith('43') || customerDetails.pincode.startsWith('44') 
                                                    ? 'Maharashtra Delivery (₹300)' 
                                                    : 'Inter-state Delivery (₹450)'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Full Address (Flat/House No, Building, Street)</label>
                                        <textarea className="input-field" value={customerDetails.address} onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})} required rows={3} placeholder="123 Farm Road, Near Market..." style={{ resize: 'vertical' }} />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ height: '3.5rem', fontSize: '1.1rem', marginTop: '1rem' }}>
                                        Proceed to Payment <ChevronRight size={20} />
                                    </button>
                                </form>
                            )}

                            {/* Step 3: Payment */}
                            {checkoutStep === 'payment' && (
                                <div className="animate-fade-in">
                                    <h3 style={{ margin: 0, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Secure Payment Integration
                                    </h3>
                                    <div style={{ background: 'var(--surface-raised)', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--surface-border)' }}>
                                        <Lock size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                            Click the button below to complete your payment securely via Razorpay.
                                        </p>
                                        <button onClick={handleRazorpayPayment} className="btn btn-primary" style={{ height: '3.5rem', fontSize: '1.1rem', width: '100%' }}>
                                            Pay ₹{orderTotal.toLocaleString()} Securely
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Order Summary</h3>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface-raised)', flexShrink: 0 }}>
                                    {selectedProduct.imageUrl ? (
                                        <img src={selectedProduct.imageUrl} alt={selectedProduct.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><ImageIcon size={24} /></div>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedProduct.productName}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Qty: 1</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                    <span>Item Total</span>
                                    <span>₹{selectedProduct.price.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                    <span>Estimated GST ({selectedProduct.gstPct}%)</span>
                                    <span>₹{((selectedProduct.price * selectedProduct.gstPct) / 100).toLocaleString()}</span>
                                </div>
                                {checkoutStep !== 'phone' && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                        <span>Delivery Charge</span>
                                        <span>{customerDetails.pincode ? `₹${deliveryCharge}` : 'Calculated at next step'}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-light)' }}>
                                <span>Total Payable</span>
                                <span>₹{orderTotal.toLocaleString()}</span>
                            </div>
                            
                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    <strong>No Return / Refund Policy:</strong> By proceeding, you agree that agricultural products sold on this platform are strictly non-refundable and non-returnable once dispatched.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Browsing View */}
                {checkoutStep === 'browse' && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Premium Agricultural Solutions</h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                                Direct to farmer formulations engineered for maximum crop yield and ultimate protection.
                            </p>
                        </div>

                        {products.length === 0 ? (
                            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <Store size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--text-tertiary)', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Store is Empty</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>No products are currently available for online purchase.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                {products.map(product => (
                                    <div key={product.id} className="glass-panel hover-lift" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
                                        <div style={{ height: '240px', background: '#fff', position: 'relative' }}>
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.productName} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-raised)', color: 'var(--text-tertiary)' }}>
                                                    <Store size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{product.productName}</h3>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', flexGrow: 1 }}>
                                                {product.description}
                                            </p>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                <div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                                                        ₹{product.price.toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>+ GST / Delivery extra</div>
                                                </div>
                                                <button 
                                                    onClick={() => handleBuyNow(product)}
                                                    className="btn btn-primary" 
                                                    disabled={product.stock <= 0}
                                                    style={{ padding: '0.75rem 1.5rem' }}
                                                >
                                                    {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Footer Disclaimer under Grid */}
                        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--surface-border)', color: 'var(--text-tertiary)' }}>
                            <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>© 2026 KaranArjun Premium Retailer SaaS. All rights reserved.</p>
                            <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={14} /> No return or refund on agricultural products once order is placed.
                            </p>
                        </div>
                    </>
                )}

            </main>
        </div>
    );
}
