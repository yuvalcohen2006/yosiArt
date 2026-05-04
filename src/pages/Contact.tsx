import { useLocale } from '@/hooks/useLocale';

/*
  Real contact details, hardcoded for now. M11 swaps these to a
  Sanity-driven `siteSettings.contact` so dad can edit them himself.
*/
const EMAIL = 'Yosicohen164@gmail.com';
const WHATSAPP_NUMBER = '97245241828';
const WHATSAPP_DISPLAY = '+972 4 524-18-28';
const INSTAGRAM_URL = 'https://www.instagram.com/_cohen_art';
const INSTAGRAM_HANDLE = '@_cohen_art';

export default function Contact() {
  const { t } = useLocale();

  return (
    <section className="px-6 md:px-12 lg:px-16 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          {t('contact.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {t('contact.title')}
        </h1>
        <div className="hairline mt-12 mb-12" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/55">
              {t('contact.email')}
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-3 block font-display text-2xl text-ink hover:text-teal transition-colors duration-300 break-all"
            >
              {EMAIL}
            </a>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/55">
              {t('contact.whatsapp')}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 block font-display text-2xl text-ink hover:text-teal transition-colors duration-300"
            >
              {WHATSAPP_DISPLAY}
            </a>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/55">
              Instagram
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 block font-display text-2xl text-ink hover:text-teal transition-colors duration-300"
            >
              {INSTAGRAM_HANDLE}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
