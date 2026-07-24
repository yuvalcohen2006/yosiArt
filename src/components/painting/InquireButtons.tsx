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

// A quieter relative of the site's primary button (see ui/cta-style.ts). These
// are not the page's call to action — the painting is — so they drop the 2px
// outline, the bold small-caps and the hover lift, and keep only the shape and
// the warm-to-accent hover. A hairline border and a single word each: the row
// reads as a choice of channel, not as two competing buttons.
const channelClass = [
  'inline-flex flex-1 items-center justify-center rounded-md px-6 py-2.5',
  'border border-ink/35 font-sans text-[13px] font-medium tracking-[0.04em] text-ink whitespace-nowrap',
  'transition-[color,border-color,background-color] duration-300 ease-out',
  'hover:border-primary hover:bg-primary/[0.04] hover:text-primary',
  'active:scale-[0.99] motion-reduce:transition-none',
].join(' ');

/**
 * The inquire row on the painting detail page — a lead-in line, then the
 * channels underneath it. Two channels for available / reserved pieces
 * (WhatsApp + email), a single commission link when the piece is sold.
 *
 * This component is the seam where future PayPal / credit-card buttons will
 * slot in alongside the existing pair without restructuring the layout.
 */
export default function InquireButtons({ painting }: Props) {
  const { t, locale } = useLocale();

  const title = pickLocale(painting.title, locale, painting.slug);
  const url = paintingPermalink(painting.slug);

  // Piece is gone — pivot the visitor toward a commission inquiry.
  const sold = painting.status === 'sold';

  return (
    <div className="flex flex-col gap-3">
      <p className="eyebrow text-[11px]">
        {sold ? t('painting.contactSold') : t('painting.contactAbout')}
      </p>

      {sold ? (
        <div className="flex max-w-sm">
          <a href={commissionEmailLink({ title, url, t })} className={channelClass}>
            {t('painting.commissionSimilar')}
          </a>
        </div>
      ) : (
        <div className="flex max-w-sm flex-col gap-2.5 sm:flex-row">
          <a
            href={whatsappInquireLink({ title, url, t })}
            target="_blank"
            rel="noreferrer noopener"
            className={channelClass}
          >
            {t('contact.whatsapp')}
          </a>
          <a href={emailInquireLink({ title, url, t })} className={channelClass}>
            {t('contact.email')}
          </a>
        </div>
      )}
    </div>
  );
}
