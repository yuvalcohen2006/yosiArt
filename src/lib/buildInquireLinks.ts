import { EMAIL, WHATSAPP_NUMBER } from './contact';

/**
 * Builders for the WhatsApp + mailto deep links used by the painting
 * detail page's Inquire buttons.
 *
 * Both helpers take a translator function (the `t` from `useLocale`)
 * so the prefilled message text comes from i18n and respects the
 * user's current locale.
 */

type Args = {
  /** Locale-aware painting title — already resolved via `pickLocale`. */
  title: string;
  /** Full canonical URL of the painting page (origin + pathname). */
  url: string;
  /** The `t` function from `useLocale`. */
  t: (key: string, opts?: Record<string, unknown>) => string;
};

/** `https://wa.me/<number>?text=<encoded prefilled message>`. */
export function whatsappInquireLink({ title, url, t }: Args): string {
  const text = t('painting.inquireWhatsappMessage', { title, url });
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** `mailto:<email>?subject=...&body=...`. */
export function emailInquireLink({ title, url, t }: Args): string {
  const subject = t('painting.inquireEmailSubject', { title, url });
  const body = t('painting.inquireEmailBody', { title, url });
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Sold-state variant — visitor asks about a commission rather than the
 *  specific (unavailable) piece. */
export function commissionEmailLink({ title, url, t }: Args): string {
  const subject = t('painting.commissionEmailSubject', { title, url });
  const body = t('painting.commissionEmailBody', { title, url });
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Build the absolute URL for a painting at runtime. SSR-safe: returns
 *  a path-only string when `window` isn't available. */
export function paintingPermalink(slug: string): string {
  if (typeof window === 'undefined') return `/work/${slug}`;
  return `${window.location.origin}/work/${slug}`;
}
