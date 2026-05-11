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
    <div className="w-full">
      <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl px-4 py-3 border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-inner">
        <Search size={18} className="text-outline shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? t('search.inputPlaceholder')}
          className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-on-surface placeholder:text-outline/60 placeholder:font-normal"
        />
        {query && (
          <button
            onClick={onClear}
            aria-label={t('common.close')}
            className="p-1 text-outline hover:text-on-surface transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {needsGps && (
          <button
            onClick={request}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            <Navigation size={12} strokeWidth={3} className={loading ? 'animate-pulse' : ''} />
            {loading ? t('search.gettingLocation') : t('search.useGps')}
          </button>
        )}

        {suggestions.length > 0 && suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className="bg-white border border-surface-container-highest rounded-full px-3 py-1.5 text-[10px] font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
