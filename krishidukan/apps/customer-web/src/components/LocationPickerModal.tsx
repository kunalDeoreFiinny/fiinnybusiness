// Location picker (F1). Supports GPS or manual selection by village / city / pincode.
import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, Search, X, MapPin } from 'lucide-react';
import { useLocation } from '../LocationContext';
import { searchLocationCatalog } from '../data/locationCatalog';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Render the modal but make it not dismissable by backdrop. Used for first-open prompt. */
  required?: boolean;
}

export function LocationPickerModal({ open, onClose, required = false }: Props) {
  const { location, requesting, requestGps, setManualEntry, dismissPrompt } = useLocation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const matches = useMemo(() => searchLocationCatalog(query, 10), [query]);

  if (!open) return null;

  function handleClose() {
    if (required) dismissPrompt();
    onClose();
  }

  async function handleGps() {
    await requestGps();
    onClose();
  }

  return (
    <div
      onClick={() => { if (!required) handleClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, padding: 0, width: '100%', maxWidth: 420, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              {required ? 'Where are you farming?' : 'Choose your location'}
            </h3>
            <p style={{ fontSize: 12, color: '#6b7280' }}>We use this to find shops and stock near you.</p>
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <button
            disabled={requesting}
            onClick={handleGps}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: requesting ? 'wait' : 'pointer', marginBottom: 14,
              opacity: requesting ? 0.85 : 1,
            }}
          >
            <LocateFixed size={16} />
            {requesting ? 'Getting location…' : 'Use my current location'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em' }}>OR PICK MANUALLY</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
            <Search size={15} style={{ color: '#9ca3af' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Village, city or pincode…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#111827' }}
              inputMode="search"
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
          {matches.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>
              No matches. Try a different name or pincode.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {matches.map((entry) => {
                const active = location.pincode === entry.pincode;
                return (
                  <button
                    key={entry.id}
                    onClick={() => { setManualEntry(entry); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', textAlign: 'left',
                      border: `1px solid ${active ? '#bbf7d0' : '#e5e7eb'}`,
                      background: active ? '#f0fdf4' : '#fff',
                      borderRadius: 10, cursor: 'pointer',
                    }}
                  >
                    <MapPin size={14} style={{ color: active ? '#15803d' : '#9ca3af', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{entry.village}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{entry.district} · {entry.state} · {entry.pincode}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
