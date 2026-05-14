// TEMP_DISABLED: Cart feature disabled temporarily
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// TEMP_DISABLED: Original imports preserved for re-enablement
// import { useEffect } from 'react';
// import { Trash2, ShoppingBag, MapPin, Zap } from 'lucide-react';
// import { PRODUCTS } from '../demoData';
// import { RETAILERS_EXTENDED } from '../data/retailers';
// import { useAuth } from '../contexts/AuthContext';
// import { useCart } from '../contexts/CartContext';

export function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // TEMP_DISABLED: Auth gate and cart data removed — showing "Coming Soon"
  return (
    <div>
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', flex: 1 }}>{t('cart.title')}</span>
      </div>

      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <ShoppingCart size={30} color="#9ca3af" strokeWidth={1.8} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Coming Soon</p>
        <p style={{ fontSize: 13, marginBottom: 20 }}>Cart feature is being prepared. Stay tuned!</p>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          {t('cart.browse')}
        </button>
      </div>
    </div>
  );
}
