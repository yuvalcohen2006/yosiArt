import { useLocale } from '@/hooks/useLocale';
import {
  EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from '@/lib/contact';
import SEO from '@/components/seo/SEO';

/* `text-start` rather than an rtl: override — the values are forced to LTR
   (they are addresses and phone numbers) but must still align to the reading
   edge of their column in both languages. */
const LINK_CLASS = [
  'mt-3 block font-sans text-lg leading-[1.8] text-ink hover:text-accent-ink',
  'break-all text-start',
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
      <div className="mx-auto max-w-4xl">
        {/* The shared section-header trio (index.css), as used by the
            collections rail, the works wall and About. */}
        <header className="text-center">
          <p className="eyebrow mb-2">{t('contact.tagline')}</p>
          <h1 className="section-title">{t('contact.title')}</h1>
          <p className="section-subtitle mx-auto mt-3 max-w-md">
            {t('contact.subtitle')}
          </p>
        </header>

        <p className="mx-auto mb-14 mt-10 max-w-2xl text-center font-sans text-lg leading-[1.8] text-ink/80">
          {t('contact.intro')}
        </p>

        {/* Three contact channels — a baseline-ruled grid: each channel
            sits under its own rule with a small-caps label and the value
            below. Stacks to one column on mobile. */}
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-3">
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
