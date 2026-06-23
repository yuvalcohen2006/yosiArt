import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import he from './he.json';

export type Locale = 'en' | 'he';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'he'];

const isBrowser = typeof window !== 'undefined';

const init = i18n.use(initReactI18next);
// LanguageDetector reads localStorage / navigator. Skip it during SSG —
// the server-rendered HTML always uses the canonical English copy, and
// the client takes over to switch the language post-hydration.
if (isBrowser) init.use(LanguageDetector);

void init.init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: isBrowser ? undefined : 'en',
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupLocalStorage: 'yosiart.locale',
  },
});

/** Mirror the active language onto <html lang> + <html dir>. Browser-only —
 *  the static HTML is emitted with `lang="en" dir="ltr"` already. */
const applyDir = (lng: string) => {
  if (!isBrowser) return;
  const isHe = lng.startsWith('he');
  document.documentElement.lang = isHe ? 'he' : 'en';
  document.documentElement.dir = isHe ? 'rtl' : 'ltr';
};

i18n.on('languageChanged', applyDir);
applyDir(i18n.resolvedLanguage ?? 'en');

export default i18n;
