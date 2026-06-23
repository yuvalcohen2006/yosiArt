import type { Locale } from '@/i18n';
import type { SanityImage } from '@/sanity/types';

/**
 * Pick the right alt text out of a Sanity image based on the active
 * locale. Hebrew speakers get `altHe`, English speakers get `alt`,
 * with cross-fallback if only one is set. Used by every painting
 * image so screen-reader users hear descriptions in their language.
 */
export function pickAlt(
  image: SanityImage | null | undefined,
  locale: Locale,
  fallback = '',
): string {
  if (!image) return fallback;
  if (locale === 'he') {
    return image.altHe ?? image.alt ?? fallback;
  }
  return image.alt ?? image.altHe ?? fallback;
}
