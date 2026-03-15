import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLang = i18n.language;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            background: 'var(--surface-raised)',
            borderRadius: '12px',
            border: '1px solid var(--surface-border)',
            marginTop: '1rem',
            marginBottom: '1rem'
        }}>
            <Languages size={18} color="var(--primary-light)" />
            <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[
                    { code: 'en', label: 'EN' },
                    { code: 'mr', label: 'मराठी' },
                    { code: 'hi', label: 'हिंदी' }
                ].map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: currentLang === lang.code ? 'var(--primary)' : 'transparent',
                            color: currentLang === lang.code ? 'white' : 'var(--text-tertiary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: currentLang === lang.code ? 600 : 400,
                            transition: 'all 0.2s'
                        }}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
