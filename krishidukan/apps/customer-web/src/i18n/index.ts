// i18next bootstrap. Imported once from main.tsx; nothing else has to call init().
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { mr } from './locales/mr';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi',   native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

const LS_KEY = 'kd_lang';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: LS_KEY,
    },
    returnNull: false,
  });

export function setLanguage(lang: LanguageCode): void {
  i18n.changeLanguage(lang);
  try { localStorage.setItem(LS_KEY, lang); } catch { /* ignore */ }
}

export default i18n;
