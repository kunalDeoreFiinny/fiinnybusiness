import { useNavigate } from 'react-router-dom';
import { MapPin, Bell, ChevronRight, Phone, HelpCircle, Heart, ShoppingCart, LogOut, LogIn, CircleUser, Wheat } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function AccountPage() {
  const { t } = useTranslation();
  const { location, requestGps } = useLocation();
  const navigate = useNavigate();
  // TEMP_DISABLED: Login/auth feature disabled for current release
  const { user, isAuthenticated } = useAuth();
  const { cart, wishlist, addresses } = useCart();

  // TEMP_DISABLED: Login/auth feature disabled — navigate directly
  function gated(path: string, _intent?: string) {
    return () => navigate(path);
  }

  const accountItems = [
    // TEMP_DISABLED: Cart and wishlist items hidden
    // { icon: ShoppingCart, label: t('account.items.cart'),      sub: isAuthenticated ? t('account.items.cartCount',      { count: cart.length })      : t('account.items.cartGuest'),      action: gated('/cart',      'add-to-cart') },
    // { icon: Heart,        label: t('account.items.wishlist'),  sub: isAuthenticated ? t('account.items.wishlistCount',  { count: wishlist.length })  : t('account.items.wishlistGuest'),  action: gated('/wishlist',  'wishlist') },
    { icon: MapPin,       label: t('account.items.addresses'), sub: isAuthenticated ? t('account.items.addressesCount', { count: addresses.length }) : t('account.items.addressesGuest'), action: gated('/addresses', 'save-address') },
  ];

  const settingsItems = [
    { icon: MapPin,      label: t('account.items.myLocation'),    sub: location.label,                            action: requestGps },
    { icon: Bell,        label: t('account.items.notifications'), sub: t('account.items.notificationsSub'),       action: () => {} },
    { icon: HelpCircle,  label: t('account.items.help'),          sub: t('account.items.helpSub'),                action: () => {} },
  ];

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', padding: '32px 16px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircleUser size={32} color="#fff" strokeWidth={1.7} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {user ? t('account.helloUser', { phone: user.phone.replace('+91', '+91 ') }) : t('account.helloFarmer')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {user ? t('account.welcomeBack') : t('account.welcomeGuest')}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* TEMP_DISABLED: Login/auth feature disabled — sign-in button hidden */}
        {/* {!isAuthenticated && (
          <button
            onClick={() => requireLogin(() => {}, 'generic')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', background: '#16a34a', color: '#fff', border: 'none',
              borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
            }}
          >
            <LogIn size={16} /> {t('account.signIn')}
          </button>
        )} */}

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 16 }}>
          {accountItems.map(({ icon: Icon, label, sub, action }, i) => (
            <button
              key={label}
              onClick={action}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', background: 'transparent', border: 'none',
                borderBottom: i < accountItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#d1d5db', flexShrink: 0 }} />
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 20 }}>
          {settingsItems.map(({ icon: Icon, label, sub, action }, i) => (
            <button
              key={label}
              onClick={action}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', background: 'transparent', border: 'none',
                borderBottom: i < settingsItems.length - 1 ? '1px solid #f3f4f6' : 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#d1d5db', flexShrink: 0 }} />
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/search')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px', background: '#fff', color: '#16a34a', border: '1px solid #bbf7d0',
            borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
          }}
        >
          <Phone size={16} /> {t('account.browseProducts')}
        </button>

        {/* TEMP_DISABLED: Login/auth feature disabled — logout hidden */}
        {/* {isAuthenticated && (
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca',
              borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
            }}
          >
            <LogOut size={15} /> {t('account.signOut')}
          </button>
        )} */}

        <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 16, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Wheat size={16} color="#15803d" strokeWidth={2.1} /> {t('account.shopOwnerTitle')}
          </div>
          <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.5, marginBottom: 12 }}>
            {t('account.shopOwnerBody')}
          </p>
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: '#16a34a', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            {t('account.shopOwnerCta')}
          </a>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 24 }}>
          {t('account.versionNote')}
        </p>
      </div>
    </div>
  );
}
