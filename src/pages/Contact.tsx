import { useLocale } from '@/hooks/useLocale';
import {
  EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from '@/lib/contact';
import SEO from '@/components/seo/SEO';

const LINK_CLASS = [
  'mt-3 block text-lg leading-[1.8] text-ink/80 hover:text-teal',
  'break-all rtl:text-right',
  'transition-colors duration-300',
].join(' ');

export default function Contact() {
  const { t } = useLocale();

  return (
    <section className="px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-20 md:pb-28">
      <SEO
        path="/contact"
        title="Contact"
        description="Reach out to Yosi about a piece, a commission, or just to say hello — every message lands directly with the artist."
      />
      <div className="mx-auto max-w-3xl">
        <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
          {t('contact.tagline')}
        </p>

        {/* Title row — h1 stays in normal flow (matching the mt-6
            spacing used by About / Works) and the link icon is
            absolutely positioned so its larger size doesn't inflate
            the row height and offset the title vertically. RTL flips
            the icon to the opposite side. */}
        <div className="relative">
          <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
            {t('contact.title')}
          </h1>
          {/* SVG lives at /public/link-icon.svg and is preloaded from
              index.html, so it's already in cache by the time someone
              opens /contact. Centred vertically against the h1 and
              allowed to overflow so the gap from tagline → h1 →
              hairline matches the other pages. */}
          <img
            src="/link-icon.svg"
            alt=""
            aria-hidden
            className="absolute top-1/2 right-0 -translate-y-1/2 rtl:right-auto rtl:left-0 rtl:-scale-x-100 h-24 md:h-32 w-auto object-contain pointer-events-none"
          />
        </div>

        <div className="hairline mt-12 mb-12" />

        <p className="text-lg leading-[1.8] text-ink/80 max-w-2xl mb-14">
          {t('contact.intro')}
        </p>

        {/* Three contact channels — flex row with justify-between gives
            evenly distributed gaps regardless of how wide each value
            is. Stacks on mobile. */}
        <div className="flex flex-col gap-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-6">
          <div className="flex flex-col">
            <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
              {t('contact.email')}
            </p>
            <a
              href={`mailto:${EMAIL}`}
              dir="ltr"
              className={LINK_CLASS}
            >
              {EMAIL}
            </a>
          </div>
          <div className="flex flex-col">
            <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
              {t('contact.whatsapp')}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer noopener"
              dir="ltr"
              className={LINK_CLASS}
            >
              {WHATSAPP_DISPLAY}
            </a>
          </div>
          <div className="flex flex-col">
            <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
              {t('contact.instagram')}
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer noopener"
              dir="ltr"
              className={LINK_CLASS}
            >
              {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
