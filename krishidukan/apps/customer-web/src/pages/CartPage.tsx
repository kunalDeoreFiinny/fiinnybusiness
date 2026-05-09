import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, MapPin, Zap, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS } from '../demoData';
import { RETAILERS_EXTENDED } from '../data/retailers';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

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
    <div>
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', flex: 1 }}>{t('cart.title')}</span>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#f0fdf4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <ShoppingCart size={30} color="#16a34a" strokeWidth={1.8} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('cart.empty')}</p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>{t('cart.emptyBody')}</p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {t('cart.browse')}
          </button>
        </div>
      ) : (
        <>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(({ item, product, retailer }) => (
              <div key={`${item.productId}-${item.retailerId}`} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, display: 'flex', gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${product.imageColor}20, ${product.imageColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                  {product.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{product.shortName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <MapPin size={11} /> {retailer.businessName}, {retailer.city}
                  </div>
                  <div style={{ fontSize: 12, color: '#374151' }}>{t('cart.qty')}: <strong>{item.qty}</strong></div>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId, item.retailerId)}
                  aria-label={t('cart.removeAria')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4, alignSelf: 'flex-start' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ padding: 16, borderTop: '1px solid #f3f4f6', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{t('cart.estimatedTotal')}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>≈ ₹{total}</span>
            </div>
            <button
              onClick={() => requireLogin(() => alert(t('cart.orderPlaceholder')), 'place-order')}
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              <Zap size={16} /> {t('cart.placeOrder')}
            </button>
            <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
              <ShoppingBag size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
              {t('cart.orderHint')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
