// Non-intrusive offline indicator (F7).
import { WifiOff } from 'lucide-react';
import { useLocation } from '../LocationContext';

export function OfflineBanner() {
  const { online } = useLocation();
  if (online) return null;
  return (
    <div
      role="status"
      style={{
        position: 'sticky', top: 60, zIndex: 35,
        background: '#fef3c7', borderBottom: '1px solid #fde68a',
        padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, color: '#92400e', fontWeight: 600,
      }}
    >
      <WifiOff size={13} />
      <span>Offline mode · Showing your last-saved data</span>
    </div>
  );
}
