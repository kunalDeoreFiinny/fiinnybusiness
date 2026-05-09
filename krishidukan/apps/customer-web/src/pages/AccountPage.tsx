import { useNavigate } from 'react-router-dom';
import { MapPin, Bell, ChevronRight, Phone, HelpCircle, Heart, ShoppingCart, LogOut, LogIn } from 'lucide-react';
import { useLocation } from '../LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function AccountPage() {
  const { location, requestGps } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, requireLogin, logout } = useAuth();
  const { cart, wishlist, addresses } = useCart();

  function gated(path: string, intent: Parameters<typeof requireLogin>[1]) {
    return () => requireLogin(() => navigate(path), intent);
  }

  const accountItems = [
    { icon: ShoppingCart, label: 'My Cart',           sub: isAuthenticated ? `${cart.length} item${cart.length !== 1 ? 's' : ''}` : 'Sign in to view',         action: gated('/cart',      'add-to-cart') },
    { icon: Heart,        label: 'My Wishlist',       sub: isAuthenticated ? `${wishlist.length} saved`                              : 'Sign in to view',         action: gated('/wishlist',  'wishlist') },
    { icon: MapPin,       label: 'Saved Addresses',   sub: isAuthenticated ? `${addresses.length} on file`                           : 'Sign in to add',          action: gated('/addresses', 'save-address') },
  ];

  const settingsItems = [
    { icon: MapPin,      label: 'My Location',     sub: location.label,                       action: requestGps },
    { icon: Bell,        label: 'Notifications',   sub: 'Get stock alerts for your products', action: () => {} },
    { icon: HelpCircle,  label: 'Help & Support',  sub: 'FAQs, contact us',                   action: () => {} },
  ];

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', padding: '32px 16px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            👤
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {user ? `Hello, ${user.phone.replace('+91', '+91 ')}` : 'Hello, Farmer!'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {user ? 'Welcome back' : 'Browse products without signing in'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {!isAuthenticated && (
          <button
            onClick={() => requireLogin(() => {}, 'generic')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', background: '#16a34a', color: '#fff', border: 'none',
              borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
            }}
          >
            <LogIn size={16} /> Sign in / Create account
          </button>
        )}

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
          <Phone size={16} /> Browse Agri Products
        </button>

        {isAuthenticated && (
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca',
              borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
            }}
          >
            <LogOut size={15} /> Sign out
          </button>
        )}

        <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 16, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>🌾 Are you a shop owner?</div>
          <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.5, marginBottom: 12 }}>
            Register your Krishi Seva Kendra on KrishiDukan and reach thousands of farmers in your area.
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
            Register Your Shop →
          </a>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 24 }}>
          KrishiDukan v1.0 · Made for Indian Farmers
        </p>
      </div>
    </div>
  );
}
