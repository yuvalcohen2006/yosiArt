import Logo from './Logo';
import { useLocale } from '@/hooks/useLocale';
import {
  EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from '@/lib/contact';

/**
 * Editorial-style footer. Two zones:
 *
 *   Top: Brand mark + tagline on the left, three labelled contact
 *   columns on the right. Generous vertical breathing room, modest
 *   text sizes — the copy is reference-grade, not brand presentation.
 *
 *   Bottom (separated by a thin hairline): a small caps row with the
 *   copyright on the left and a single-line attribution on the right.
 */
export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-ink/15">
      <div className="mx-auto max-w-5xl px-6 md:px-12 lg:px-16 pt-16 pb-8">
        {/* Top: brand + contacts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-6 lg:col-span-7 flex flex-col gap-5">
            <Logo variant="footer" />
            <p className="text-sm text-ink/60 max-w-xs leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="md:col-span-6 lg:col-span-5">
            {/* Vertical stack — each contact gets full column width so the
                email and phone never wrap mid-line. */}
            <ul className="flex flex-col gap-6">
              <li>
                <p className="text-[10px] uppercase tracking-[0.176em] text-ink/45 mb-1.5">
                  {t('contact.email')}
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  dir="ltr"
                  className="block text-sm text-ink/85 hover:text-teal transition-colors duration-300 whitespace-nowrap rtl:text-right"
                >
                  {EMAIL}
                </a>
              </li>
              <li>
                <p className="text-[10px] uppercase tracking-[0.176em] text-ink/45 mb-1.5">
                  {t('contact.whatsapp')}
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  dir="ltr"
                  className="block text-sm text-ink/85 hover:text-teal transition-colors duration-300 whitespace-nowrap rtl:text-right"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <p className="text-[10px] uppercase tracking-[0.176em] text-ink/45 mb-1.5">
                  {t('contact.instagram')}
                </p>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  dir="ltr"
                  className="block text-sm text-ink/85 hover:text-teal transition-colors duration-300 whitespace-nowrap rtl:text-right"
                >
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: copyright + attribution */}
        <div className="mt-16 pt-6 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.176em] text-ink/45">
          <span>© {year} YosiArt</span>
          <span>Acrylic paintings by Yosi Cohen</span>
        </div>
      </div>
    </footer>
  );
}
