import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, Translations, LANGUAGE_NAMES } from '../translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isDetecting: boolean;
  languageNames: typeof LANGUAGE_NAMES;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'pp_language';
const IPINFO_TOKEN = 'e8b12000886537';

// Maps ipinfo region names → language codes (only targeted states)
const STATE_LANGUAGE_MAP: Partial<Record<string, Language>> = {
  'Maharashtra': 'mr',
  'Karnataka': 'kn',
  'Gujarat': 'gu',
  'Uttar Pradesh': 'hi',
  'Bihar': 'hi',
  'Madhya Pradesh': 'hi',
};

async function detectLanguageFromIP(): Promise<Language> {
  try {
    const res = await fetch(`https://ipinfo.io/json?token=${IPINFO_TOKEN}`);
    if (!res.ok) return 'en';
    const data = await res.json() as { country?: string; region?: string };
    if (data.country !== 'IN') return 'en';
    return STATE_LANGUAGE_MAP[data.region ?? ''] ?? 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
      setIsDetecting(false);
      return;
    }

    void detectLanguageFromIP().then((detected) => {
      setLanguageState(detected);
      setIsDetecting(false);
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        isDetecting,
        languageNames: LANGUAGE_NAMES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
