// MVP search bar with quick-suggest chips. Triggers GPS request if user is still on default location.
import { Search, X, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserLocation } from '../hooks/useUserLocation';

interface Props {
  query: string;
  onChange: (q: string) => void;
  onClear: () => void;
  suggestions?: string[];
  placeholder?: string;
}

export function ProductSearch({ query, onChange, onClear, suggestions = [], placeholder }: Props) {
  const { t } = useTranslation();
  const { source, loading, request } = useUserLocation();
  const needsGps = source === 'default';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f3f4f6', borderRadius: 12, padding: '11px 14px' }}>
        <Search size={18} color="#6b7280" />
        <input
          autoFocus
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? t('search.inputPlaceholder')}
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 15, color: '#111827' }}
        />
        {query && (
          <button
            onClick={onClear}
            aria-label={t('common.close')}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {needsGps && (
        <button
          onClick={request}
          disabled={loading}
          style={{
            marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#fff', color: '#15803d',
            border: '1px solid #bbf7d0', borderRadius: 999,
            padding: '6px 12px', fontSize: 12, fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          <Navigation size={13} strokeWidth={2.3} />
          {loading ? t('search.gettingLocation') : t('search.useGps')}
        </button>
      )}

      {suggestions.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onChange(s)}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, padding: '6px 12px', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 500 }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
