import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n';

/**
 * Convenience wrapper around `useTranslation` that exposes a typed locale and
 * a `setLocale` setter. The actual <html lang|dir> sync lives in `src/i18n`
 * (fires once globally per language change), so consumers only need to call
 * `setLocale('he' | 'en')` to flip the whole site.
 */
export function useLocale() {
  const { i18n, t } = useTranslation();
  const raw = i18n.resolvedLanguage ?? 'en';
  const locale: Locale = (
    SUPPORTED_LOCALES.includes(raw as Locale) ? raw : 'en'
  ) as Locale;

  const setLocale = (next: Locale) => {
    if (next !== locale) void i18n.changeLanguage(next);
  };

  return { locale, setLocale, t };
}
