// Globe button + dropdown. Sits in the navbar between Login and Cart.
// Persists choice via i18next-browser-languagedetector (localStorage).
import { useEffect, useRef, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, setLanguage, type LanguageCode } from '../i18n';

interface Props {
  /** Compact mode: hide the language label, show only the globe (used at very narrow widths). */
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: Props) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const active = (SUPPORTED_LANGUAGES.find((l) => l.code === i18n.resolvedLanguage)
    ?? SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language?.split('-')[0])
    ?? SUPPORTED_LANGUAGES[0]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handlePick(code: LanguageCode) {
    setLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('nav.languageAria')}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'transparent', color: '#111827',
          border: '1px solid #eef0f3',
          padding: compact ? '7px' : '7px 10px',
          borderRadius: 10, cursor: 'pointer',
        }}
      >
        <Globe size={17} strokeWidth={1.9} />
        {!compact && (
          <>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{active.native}</span>
            <ChevronDown size={13} color="#6b7280" />
          </>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('language.label')}
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: '#fff', border: '1px solid #eef0f3', borderRadius: 12,
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
            minWidth: 168, padding: 6, zIndex: 60,
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang.code === active.code;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => handlePick(lang.code)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 10, padding: '9px 12px', border: 'none',
                  background: isActive ? '#f0fdf4' : 'transparent',
                  color: isActive ? '#15803d' : '#111827',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span>{lang.native}</span>
                {isActive && <Check size={14} strokeWidth={2.4} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
