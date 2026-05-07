import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShopStatus } from '@krishidukan/shared';

export function PendingApprovalPage() {
  const { shop, refreshShop, logout } = useAuth();
  const navigate = useNavigate();

  // Poll every 30 seconds — redirect once approved
  useEffect(() => {
    if (shop?.status === ShopStatus.ACTIVE) {
      navigate('/dashboard');
      return;
    }
    if (shop?.status === ShopStatus.REJECTED) return;

    const interval = setInterval(() => {
      void refreshShop();
    }, 30_000);
    return () => clearInterval(interval);
  }, [shop?.status, navigate, refreshShop]);

  const isRejected = shop?.status === ShopStatus.REJECTED;

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {isRejected ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', marginBottom: 10 }}>Registration Rejected</h2>
            <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Your shop registration was not approved.
            </p>
            {shop && 'adminNotes' in shop && (shop as { adminNotes?: string }).adminNotes && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626', textAlign: 'left' }}>
                <strong>Reason:</strong> {(shop as { adminNotes?: string }).adminNotes}
              </div>
            )}
            <p style={{ color: '#6b7280', fontSize: 13 }}>Please contact support or re-register with correct documents.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#14532d', marginBottom: 10 }}>Under Review</h2>
            <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Your shop <strong>{shop?.businessName}</strong> has been registered and is awaiting license verification by our team.
            </p>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#14532d', marginBottom: 10 }}>Next steps:</p>
              <ol style={{ paddingLeft: 18, fontSize: 13, color: '#374151', lineHeight: 2 }}>
                <li>Upload your license documents (Pesticide/Fertilizer/Seed license)</li>
                <li>Our team will verify them within 1-2 business days</li>
                <li>You'll receive a call once approved</li>
              </ol>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 12 }}>This page checks for updates every 30 seconds automatically.</p>
          </>
        )}
        <button
          onClick={() => void logout()}
          style={{ marginTop: 24, background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
