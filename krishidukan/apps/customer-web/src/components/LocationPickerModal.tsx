import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, Search, X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../LocationContext';
import { searchLocationCatalog } from '../data/locationCatalog';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Render the modal but make it not dismissable by backdrop. Used for first-open prompt. */
  required?: boolean;
}

export function LocationPickerModal({ open, onClose, required = false }: Props) {
  const { t } = useTranslation();
  const { location, requesting, requestGps, setManualEntry, dismissPrompt } = useLocation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const matches = useMemo(() => searchLocationCatalog(query, 10), [query]);

  function handleClose() {
    if (required) dismissPrompt();
    onClose();
  }

  async function handleGps() {
    await requestGps();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!required) handleClose(); }}
            className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-surface-container flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-on-surface tracking-tight leading-none">
                  {required ? t('location.promptTitleRequired') : t('location.promptTitle')}
                </h3>
                <p className="text-xs font-semibold text-on-surface-variant mt-1.5 opacity-70">
                  {t('location.promptBody')}
                </p>
              </div>
              {!required && (
                <button 
                  onClick={handleClose} 
                  className="p-2 hover:bg-surface-container rounded-full transition-colors text-outline"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="p-6 pb-4">
              <button
                disabled={requesting}
                onClick={handleGps}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-70"
              >
                <LocateFixed size={18} className={requesting ? 'animate-spin' : ''} />
                {requesting ? t('search.gettingLocation') : t('location.useCurrent')}
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-surface-container-highest" />
                <span className="text-[10px] font-black uppercase tracking-widest text-outline">
                  {t('location.pickManually')}
                </span>
                <div className="flex-1 h-px bg-surface-container-highest" />
              </div>

              <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl px-4 py-3 border border-outline-variant focus-within:border-primary transition-all">
                <Search size={18} className="text-outline" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('location.searchPlaceholder')}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-on-surface placeholder:font-normal"
                  inputMode="search"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="flex flex-col gap-2">
                {matches.length === 0 ? (
                  <p className="text-center py-10 text-on-surface-variant text-sm font-bold opacity-50">
                    {t('location.noMatches')}
                  </p>
                ) : (
                  matches.map((entry) => {
                    const active = location.pincode === entry.pincode;
                    return (
                      <button
                        key={entry.id}
                        onClick={() => { setManualEntry(entry); onClose(); }}
                        className={`flex items-center gap-4 p-4 text-left rounded-2xl border-2 transition-all group ${
                          active 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-white border-surface-container hover:border-outline-variant'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          active ? 'bg-primary text-white' : 'bg-surface-container-low text-secondary'
                        }`}>
                          <MapPin size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                            {entry.village}
                          </div>
                          <div className="text-[10px] font-semibold text-on-surface-variant opacity-70">
                            {entry.district} · {entry.state} · {entry.pincode}
                          </div>
                        </div>
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
