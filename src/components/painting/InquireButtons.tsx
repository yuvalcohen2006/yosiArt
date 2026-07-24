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

const buttonClass = [
  'inline-flex items-center justify-center rounded-sm px-4 py-2',
  'border border-ink font-sans font-medium text-xs uppercase tracking-[0.1em] text-ink whitespace-nowrap',
  'transition-[color,border-color,background-color,transform] duration-300 ease-out',
  'hover:border-primary hover:text-primary hover:bg-primary/[0.05]',
  'active:scale-[0.98]',
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
    return (
      <div className="flex flex-col gap-3">
        <p className="eyebrow text-[11px]">{t('painting.contactAbout')}</p>
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
    <div className="flex flex-col gap-3">
      <p className="eyebrow text-[11px]">{t('painting.contactAbout')}</p>
      <div className="flex flex-col sm:flex-row gap-2.5 max-w-xs">
        <a
          href={whatsappInquireLink({ title, url, t })}
          target="_blank"
          rel="noreferrer noopener"
          className={buttonClass}
        >
          WhatsApp
        </a>
        <a
          href={emailInquireLink({ title, url, t })}
          className={buttonClass}
        >
          Email
        </a>
      </div>
    </div>
  );
}
