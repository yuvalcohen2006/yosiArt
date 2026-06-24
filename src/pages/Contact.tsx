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
  'mt-3 block text-lg leading-[1.8] text-ink hover:text-accent',
  'break-all rtl:text-right',
  'transition-colors duration-300',
].join(' ');

export default function Contact() {
  const { t } = useLocale();

  // Prefilled message + subject/body so the recipient knows the
  // contact came in from the website. Same pattern the painting-page
  // Inquire buttons use, just locale-aware copy without painting
  // metadata.
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t('contact.generalWhatsappMessage'),
  )}`;
  const emailHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
    t('contact.generalEmailSubject'),
  )}&body=${encodeURIComponent(t('contact.generalEmailBody'))}`;

  return (
    <section className="px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-20 md:pb-28">
      <SEO
        path="/contact"
        title="Contact"
        description="Reach out to Yosi about a piece, a commission, or just to say hello — every message lands directly with the artist."
      />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">
          <span aria-hidden className="text-accent">— </span>
          {t('contact.tagline')}
        </p>

        {/* Title row — h1 stays in normal flow (matching the mt-6
            spacing used by About / Works) and the link icon is
            absolutely positioned so its larger size doesn't inflate
            the row height and offset the title vertically. RTL flips
            the icon to the opposite side. */}
        <div className="relative">
          <h1 className="mt-6 font-display font-black text-6xl md:text-8xl tracking-tight leading-none">
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

        <div className="rule mt-12 mb-12" />

        <p className="text-lg leading-[1.8] text-ink/80 max-w-2xl mb-14">
          {t('contact.intro')}
        </p>

        {/* Three contact channels — a baseline-ruled grid: each channel
            sits under its own rule with a small-caps label and the value
            below. Stacks to one column on mobile. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8">
          <div className="flex flex-col border-t border-line pt-5">
            <p className="eyebrow">{t('contact.email')}</p>
            <a href={emailHref} dir="ltr" className={LINK_CLASS}>
              {EMAIL}
            </a>
          </div>
          <div className="flex flex-col border-t border-line pt-5">
            <p className="eyebrow">{t('contact.whatsapp')}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer noopener"
              dir="ltr"
              className={LINK_CLASS}
            >
              {WHATSAPP_DISPLAY}
            </a>
          </div>
          <div className="flex flex-col border-t border-line pt-5">
            <p className="eyebrow">{t('contact.instagram')}</p>
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
