import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle, Loader2, QrCode } from 'lucide-react';
import {
  doc, getDoc, collection, query, where, getDocs,
  setDoc, updateDoc, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

interface Product {
  id: string;
  name: string;
  mrp?: number;
  retailPrice?: number;
  sellingPrice?: number;
  loosePieces?: number;
  imageUrl?: string;
  category?: string;
  sku?: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

function getPrice(p: Product) {
  return Number(p.sellingPrice || p.retailPrice || p.mrp || 0);
}

export default function VCheckoutPage() {
  const { tenantId, token } = useParams<{ tenantId: string; token: string }>();

  const [sessionStatus, setSessionStatus] = useState<'loading' | 'active' | 'confirmed' | 'expired' | 'invalid'>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (!tenantId || !token) { setSessionStatus('invalid'); return; }

    // Load tenant info
    getDoc(doc(db, 'tenants', tenantId)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setBusinessName(d.businessName || '');
        setLogoUrl(d.logoUrl || '');
      }
    });

    // Watch session doc
    const sessionRef = doc(db, 'tenants', tenantId, 'vcheckoutSessions', token);
    const unsub = onSnapshot(sessionRef, snap => {
      if (!snap.exists()) { setSessionStatus('invalid'); return; }
      const d = snap.data();
      if (d.status === 'confirmed') { setSessionStatus('confirmed'); return; }
      if (d.expiresAt?.toDate?.() < new Date()) { setSessionStatus('expired'); return; }
      setSessionStatus('active');
    });

    return () => unsub();
  }, [tenantId, token]);

  // Load products
  useEffect(() => {
    if (!tenantId || sessionStatus !== 'active') return;
    const col = collection(db, 'tenants', tenantId, 'products');
    getDocs(query(col, where('isActive', '!=', false))).then(snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
  }, [tenantId, sessionStatus]);

  const filtered = products.filter(p =>
    !searchTerm ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(ci => ci.product.id === product.id);
      if (existing) return prev.map(ci => ci.product.id === product.id ? { ...ci, qty: ci.qty + 1 } : ci);
      return [...prev, { product, qty: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev =>
      prev
        .map(ci => ci.product.id === productId ? { ...ci, qty: ci.qty + delta } : ci)
        .filter(ci => ci.qty > 0)
    );
  }

  const cartTotal = cart.reduce((s, ci) => s + getPrice(ci.product) * ci.qty, 0);
  const cartCount = cart.reduce((s, ci) => s + ci.qty, 0);

  async function submitCart() {
    if (!tenantId || !token || cart.length === 0) return;
    setSubmitting(true);
    try {
      const lineItems = cart.map(ci => ({
        productId: ci.product.id,
        productName: ci.product.name,
        sku: ci.product.sku || '',
        quantity: ci.qty,
        unitPrice: getPrice(ci.product),
        total: getPrice(ci.product) * ci.qty,
      }));

      await updateDoc(doc(db, 'tenants', tenantId, 'vcheckoutSessions', token), {
        lineItems,
        cartTotal,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
    } catch (e: any) {
      alert('Failed to submit cart. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Status screens ──────────────────────────────────────────────
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (sessionStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cart Accepted!</h2>
          <p className="text-gray-500">The cashier has your order. Please proceed to the billing counter.</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === 'expired' || sessionStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {sessionStatus === 'expired' ? 'Session Expired' : 'Invalid Session'}
          </h2>
          <p className="text-gray-500 text-sm">
            {sessionStatus === 'expired'
              ? 'This QR code has expired. Please ask the cashier to generate a new one.'
              : 'This QR code is not valid. Please scan the QR code at the billing counter.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt="" className="w-8 h-8 object-contain rounded" />}
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">{businessName || 'Store'}</h1>
            <p className="text-xs text-gray-500">Self-checkout — scan items to add</p>
          </div>
          {cartCount > 0 && (
            <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {cartCount}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
            placeholder="Search products…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Cart items */}
        {cart.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Your Cart
            </h3>
            <div className="space-y-2">
              {cart.map(ci => (
                <div key={ci.product.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{ci.product.name}</p>
                    <p className="text-xs text-gray-500">₹{getPrice(ci.product).toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateQty(ci.product.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                      {ci.qty === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-gray-600" />}
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{ci.qty}</span>
                    <button onClick={() => updateQty(ci.product.id, 1)} className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition">
                      <Plus className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 w-16 text-right shrink-0">
                    ₹{(getPrice(ci.product) * ci.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product grid */}
        <div>
          <p className="text-xs text-gray-500 mb-2">{filtered.length} products</p>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => {
              const inCart = cart.find(ci => ci.product.id === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-white rounded-xl p-3 shadow-sm border text-left transition active:scale-95 ${inCart ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                  ) : (
                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <p className="font-medium text-gray-800 text-sm leading-tight line-clamp-2">{product.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-blue-600 font-bold text-sm">₹{getPrice(product).toFixed(2)}</p>
                    {inCart && (
                      <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{inCart.qty}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No products found</p>
          )}
        </div>
      </div>

      {/* Sticky checkout bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-20">
          <div className="max-w-lg mx-auto flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500">{cartCount} items</p>
              <p className="text-xl font-bold text-gray-800">₹{cartTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={submitCart}
              disabled={submitting}
              className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {submitting ? 'Sending to Cashier…' : 'Send to Cashier'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
