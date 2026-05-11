import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, MapPin, Zap, ShoppingCart, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS } from '../demoData';
import { RETAILERS_EXTENDED } from '../data/retailers';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, requireLogin } = useAuth();
  const { cart, removeFromCart } = useCart();

  // Defense-in-depth: open the login gate if a guest deep-links here.
  useEffect(() => {
    if (!isAuthenticated) requireLogin(() => {}, 'add-to-cart');
  }, [isAuthenticated, requireLogin]);

  const items = cart.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    const retailer = RETAILERS_EXTENDED.find((r) => r.id === item.retailerId);
    return product && retailer ? { item, product, retailer } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const total = items.reduce((acc, { item }) => acc + item.qty * 500, 0); // mock pricing — joins to RETAILER_STOCK happen on real backend

  return (
    <div className="max-w-3xl mx-auto w-full min-h-[calc(100vh-64px)] flex flex-col bg-surface-container-lowest md:bg-transparent">
      {/* Mobile-only Header (since Layout already has a header, this acts as a sub-header or title) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md md:bg-transparent border-b border-surface-container md:border-none px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-surface-container rounded-full transition-colors md:bg-white md:shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-on-surface tracking-tight">{t('cart.title')}</h1>
      </div>

      <div className="flex-1 p-4 md:px-0 flex flex-col gap-6">
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-[32px] bg-surface-container flex items-center justify-center mb-8 shadow-sm border border-surface-container-highest">
              <ShoppingCart className="w-12 h-12 text-outline/40" />
            </div>
            <h2 className="text-3xl font-black text-on-surface mb-3 tracking-tight">{t('cart.empty')}</h2>
            <p className="text-on-surface-variant max-w-xs mb-10 font-medium opacity-70 leading-relaxed">{t('cart.emptyBody')}</p>
            <button
              onClick={() => navigate('/market')}
              className="bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {t('cart.browse')}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col gap-5">
              <AnimatePresence>
                {items.map(({ item, product, retailer }) => (
                  <motion.div 
                    key={`${item.productId}-${item.retailerId}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    className="bg-white rounded-[32px] p-6 shadow-sm border border-surface-container flex gap-6 group hover:shadow-ambient transition-all"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-surface-container shrink-0 shadow-inner">
                      <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt={product.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-black text-on-surface truncate pr-2 tracking-tight leading-none">{product.shortName}</h3>
                        <button
                          onClick={() => removeFromCart(item.productId, item.retailerId)}
                          aria-label={t('cart.removeAria')}
                          className="p-1.5 text-outline/40 hover:text-error transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-black uppercase tracking-tight mt-1 opacity-60">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        <span className="truncate">{retailer.businessName}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-surface-container-low rounded-xl px-3 py-1.5 gap-4 shadow-inner">
                          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em]">{t('cart.qty')}</span>
                          <span className="text-base font-black text-on-surface">{item.qty}</span>
                        </div>
                        <div className="text-xl font-black text-secondary tracking-tighter">₹{item.qty * 500}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 md:mb-16 bg-white md:rounded-[40px] p-8 border-t md:border border-surface-container shadow-[0_-10px_40px_rgba(0,0,0,0.04)] md:shadow-ambient flex flex-col gap-8 -mx-4 md:mx-0 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              <div className="flex justify-between items-end relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-1">{t('cart.estimatedTotal')}</span>
                  <div className="text-4xl font-black text-primary tracking-tighter">₹{total}</div>
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-variant bg-surface-container px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-surface-container-highest">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Free Delivery Eligible
                </div>
              </div>

              <button
                onClick={() => requireLogin(() => alert(t('cart.orderPlaceholder')), 'place-order')}
                className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] py-5 rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10"
              >
                <Zap className="w-6 h-6 fill-current" /> {t('cart.placeOrder')}
              </button>

              <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-outline/40 relative z-10">
                <Zap className="w-3 h-3" />
                <span>Secure Checkout by Krishidukan Pay</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
