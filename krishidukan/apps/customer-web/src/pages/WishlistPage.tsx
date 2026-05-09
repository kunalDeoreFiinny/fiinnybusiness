import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS } from '../demoData';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function WishlistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, requireLogin } = useAuth();
  const { wishlist, toggleWishlist } = useCart();

  useEffect(() => {
    if (!isAuthenticated) requireLogin(() => {}, 'wishlist');
  }, [isAuthenticated, requireLogin]);

  const items = wishlist
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div>
      <div style={{ position: 'sticky', top: 60, zIndex: 30, background: '#fff', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#374151' }}>
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', flex: 1 }}>{t('wishlist.title')}</span>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fef2f2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Heart size={30} color="#dc2626" strokeWidth={1.8} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{t('wishlist.empty')}</p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>{t('wishlist.emptyBody')}</p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {t('wishlist.browse')}
          </button>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((product) => (
            <div key={product.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={() => navigate(`/product/${product.id}`)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', flex: 1, textAlign: 'left' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${product.imageColor}20, ${product.imageColor}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {product.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{product.shortName}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{product.categoryLabel}</div>
                </div>
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label={t('wishlist.removeAria')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 6 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
