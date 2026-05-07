import type { Locale } from '@/i18n';
import type { LocalizedString, LocalizedText } from '@/sanity/types';

/**
 * Pick the right language out of a Sanity localized field, falling back
 * across languages so we never show a blank if just one was filled in.
 */
export function pickLocale(
  value: LocalizedString | LocalizedText | null | undefined,
  locale: Locale,
  fallback = '',
): string {
  if (!value) return fallback;
  return value[locale] ?? value.en ?? value.he ?? fallback;
}
