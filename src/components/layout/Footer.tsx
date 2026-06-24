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

  const contacts = [
    { label: t('contact.email'), value: EMAIL, href: `mailto:${EMAIL}`, ext: false },
    {
      label: t('contact.whatsapp'),
      value: WHATSAPP_DISPLAY,
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
      ext: true,
    },
    {
      label: t('contact.instagram'),
      value: INSTAGRAM_HANDLE,
      href: INSTAGRAM_URL,
      ext: true,
    },
  ];

  return (
    <footer className="mt-32 border-t border-line">
      <div className="editorial-container pt-16 pb-8">
        {/* Top: brand + contacts */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-6 lg:col-span-7 flex flex-col gap-5">
            <Logo variant="footer" />
            <p className="text-sm text-slate max-w-xs leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Contact grid — baseline-ruled rows, small-caps Heebo labels,
              values in body type. */}
          <ul className="md:col-span-6 lg:col-span-5 flex flex-col">
            {contacts.map((c, i) => (
              <li
                key={c.label}
                className={[
                  'flex flex-col gap-1.5 py-5',
                  i === 0 ? 'border-t border-line' : 'border-t border-line',
                ].join(' ')}
              >
                <p className="eyebrow text-[10px]">{c.label}</p>
                <a
                  href={c.href}
                  dir="ltr"
                  {...(c.ext
                    ? { target: '_blank', rel: 'noreferrer noopener' }
                    : {})}
                  className="block text-base text-ink hover:text-accent transition-colors duration-300 whitespace-nowrap rtl:text-right"
                >
                  {c.value}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: copyright + attribution */}
        <div className="mt-16 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-3 eyebrow text-[10px]">
          <span>© {year} YosiArt</span>
          <span>Acrylic paintings by Yosi Cohen</span>
        </div>
      </div>
    </footer>
  );
}
