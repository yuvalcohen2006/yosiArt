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

// Same border + hover-fill pattern as before, plus a quiet press
// feedback: on `:active` (mouse-down or finger-tap) the button flips
// to its filled state AND shrinks by 2 %, so the tap registers visually
// before the external app (WhatsApp / mail client) takes over. No
// toasts, no confirmation text — just the button reacting.
const buttonClass = [
  'flex-1 inline-flex items-center justify-center px-5 py-3',
  'border border-ink/65 text-xs uppercase tracking-[0.176em] text-ink whitespace-nowrap',
  'hover:bg-ink hover:text-paper',
  'active:bg-ink active:text-paper active:scale-[0.98]',
  'transition duration-200',
].join(' ');

/**
 * The "Inquire" button row on the painting detail page. Two channels for
 * available / reserved pieces (WhatsApp + email), a single commission
 * link when the piece is sold.
 *
 * This component is the seam where future PayPal / credit-card buttons
 * will slot in alongside the existing pair without restructuring the
 * surrounding layout.
 */
export default function InquireButtons({ painting }: Props) {
  const { t, locale } = useLocale();

  const title = pickLocale(painting.title, locale, painting.slug);
  const url = paintingPermalink(painting.slug);

  if (painting.status === 'sold') {
    // Piece is gone — pivot the visitor toward a commission inquiry.
    return (
      <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
        <a
          href={commissionEmailLink({ title, url, t })}
          className={buttonClass}
        >
          {t('painting.commissionSimilar')}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
      <a
        href={whatsappInquireLink({ title, url, t })}
        target="_blank"
        rel="noreferrer noopener"
        className={buttonClass}
      >
        {t('painting.inquireWhatsapp')}
      </a>
      <a
        href={emailInquireLink({ title, url, t })}
        className={buttonClass}
      >
        {t('painting.inquireEmail')}
      </a>
    </div>
  );
}
