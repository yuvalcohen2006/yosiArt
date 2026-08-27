import { Mail } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { pickLocale } from '@/lib/pickLocale';
import {
  commissionEmailLink,
  emailInquireLink,
  paintingPermalink,
  whatsappInquireLink,
} from '@/lib/buildInquireLinks';
import type { Painting } from '@/sanity/types';

type Props = { painting: Painting };

/** WhatsApp's brand mark. Lucide dropped brand glyphs, and a generic speech
 *  bubble would not be recognised as WhatsApp at 20px. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

// A quieter relative of the site's primary button (see ui/cta-style.ts). These
// are not the page's call to action — the painting is — so they drop the 2px
// outline, the bold small-caps and the hover lift, keeping only the shape and
// the warm-to-accent hover. Square and 48px so each one clears the 44px
// minimum touch target on its own, without relying on the row's width.
const channelClass = [
  'inline-flex h-12 w-12 items-center justify-center rounded-md',
  'border border-ink/35 text-ink',
  'transition-[color,border-color,background-color] duration-300 ease-out',
  'hover:border-primary hover:bg-primary/[0.04] hover:text-primary',
  'active:scale-[0.98] motion-reduce:transition-none',
].join(' ');

/**
 * The inquire row on the painting detail page — a lead-in line, then the
 * channels underneath it. Two channels for available / reserved pieces
 * (WhatsApp + email), a single commission link when the piece is sold.
 *
 * The two channel buttons are icon-only, so each carries an `aria-label`: with
 * no text inside, that label IS the accessible name, and without it a screen
 * reader would announce only the destination URL. `title` gives sighted mouse
 * users the same wording on hover.
 *
 * This component is the seam where future PayPal / credit-card buttons will
 * slot in alongside the existing pair without restructuring the layout.
 */
export default function InquireButtons({ painting }: Props) {
  const { t, locale } = useLocale();

  const title = pickLocale(painting.title, locale, painting.slug);
  const url = paintingPermalink(painting.slug);
  const sold = painting.status === 'sold';

  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-base text-slate">
        {sold ? t('painting.contactSold') : t('painting.contactAbout')}
      </p>

      {sold ? (
        <div className="flex">
          <a
            href={commissionEmailLink({ title, url, t })}
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-ink/35 px-5 font-sans text-[13px] font-medium tracking-[0.04em] text-ink transition-[color,border-color,background-color] duration-300 ease-out hover:border-primary hover:bg-primary/[0.04] hover:text-primary motion-reduce:transition-none"
          >
            {t('painting.commissionSimilar')}
          </a>
        </div>
      ) : (
        <div className="flex gap-3">
          <a
            href={whatsappInquireLink({ title, url, t })}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t('contact.whatsapp')}
            title={t('contact.whatsapp')}
            className={channelClass}
          >
            <WhatsAppGlyph className="h-5 w-5" />
          </a>
          <a
            href={emailInquireLink({ title, url, t })}
            aria-label={t('contact.email')}
            title={t('contact.email')}
            className={channelClass}
          >
            <Mail aria-hidden className="h-5 w-5" />
          </a>
        </div>
      )}
    </div>
  );
}
