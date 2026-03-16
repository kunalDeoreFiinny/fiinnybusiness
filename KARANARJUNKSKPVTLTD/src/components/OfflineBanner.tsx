import { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, X } from 'lucide-react';


export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setIsOnline(false);
      setDismissed(false);
    };
    const goOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4000);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!dismissed && !isOnline) return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #1f2937, #111827)', color: '#fff',
      padding: '0.75rem 1.25rem', borderRadius: '14px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(16px)', animation: 'slideUp 0.3s ease',
      maxWidth: '90vw',
    }}>
      <WifiOff size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Working Offline</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Changes will sync when you're back online</div>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px', marginLeft: '0.5rem', flexShrink: 0 }}>
        <X size={16} />
      </button>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );

  if (showReconnected) return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #065f46, #047857)', color: '#fff',
      padding: '0.75rem 1.25rem', borderRadius: '14px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(16px)', animation: 'slideUp 0.3s ease',
    }}>
      <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Back Online!</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Your data is syncing...</div>
      </div>
    </div>
  );

  return null;
}
