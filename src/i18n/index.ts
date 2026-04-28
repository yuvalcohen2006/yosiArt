import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import he from './he.json';

export type Locale = 'en' | 'he';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'he'];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LOCALES,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'yosiart.locale',
    },
  });

/** Mirror the active language onto <html lang> + <html dir>. */
const applyDir = (lng: string) => {
  const isHe = lng.startsWith('he');
  document.documentElement.lang = isHe ? 'he' : 'en';
  document.documentElement.dir = isHe ? 'rtl' : 'ltr';
};

i18n.on('languageChanged', applyDir);
applyDir(i18n.resolvedLanguage ?? 'en');

export default i18n;
