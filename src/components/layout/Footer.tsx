import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import Reveal from '../fx/Reveal';
import { useLocale } from '@/hooks/useLocale';
import { EMAIL, INSTAGRAM_URL, WHATSAPP_NUMBER } from '@/lib/contact';

/** Instagram outline glyph — lucide-react v1 removed brand icons, so the
 *  classic lucide path lives here as a local component. */
function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

type FooterLink = {
  title: string;
  /** Internal links start with '/'; anything else renders as a plain <a>. */
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type FooterSection = {
  label: string;
  links: FooterLink[];
};

const LINK_CLS =
  'inline-flex items-center gap-1.5 text-slate transition-colors duration-300 hover:text-primary';

/**
 * Site footer — flame-palette take on the animated column footer.
 *
 * A warm radial wash rises from the top hairline (with a soft blurred
 * orange thread at its centre), then four zones: the brand block
 * (signature, tagline, copyright) and three link columns — site
 * navigation, the Israeli legal pages, and the real contact channels.
 * Each zone reveals on first scroll into view (via the shared Reveal
 * wrapper, which keeps hidden content inert until it appears).
 */
export default function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const sections: FooterSection[] = [
    {
      label: t('footer.navigate'),
      links: [
        { title: t('nav.works'), href: '/works' },
        { title: t('nav.about'), href: '/about' },
        { title: t('nav.contact'), href: '/contact' },
      ],
    },
    {
      label: t('footer.legal'),
      links: [
        { title: t('legal.terms'), href: '/terms' },
        { title: t('legal.privacy'), href: '/privacy' },
        { title: t('legal.accessibility'), href: '/accessibility' },
      ],
    },
    {
      label: t('footer.contactTitle'),
      links: [
        { title: t('contact.email'), href: `mailto:${EMAIL}`, icon: Mail },
        {
          title: t('contact.whatsapp'),
          href: `https://wa.me/${WHATSAPP_NUMBER}`,
          icon: MessageCircle,
        },
        {
          title: t('contact.instagram'),
          href: INSTAGRAM_URL,
          icon: InstagramGlyph,
        },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 w-full border-t border-line bg-[radial-gradient(40%_140px_at_50%_0%,rgba(235,94,40,0.07),transparent)]">
      {/* Soft orange thread along the top hairline. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/50 blur"
      />

      <div className="editorial-container pb-8 pt-16 lg:pt-20">
        <div className="grid w-full gap-10 xl:grid-cols-3 xl:gap-8">
          <Reveal className="flex flex-col items-start gap-4" distance={12}>
            <Logo variant="footer" />
            <p className="max-w-xs text-sm leading-relaxed text-slate">
              {t('footer.tagline')}
            </p>
            <p className="text-sm text-slate">
              © {year} YosiArt. {t('footer.rights')}
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 xl:col-span-2">
            {sections.map((section, index) => (
              <Reveal
                key={section.label}
                delay={0.1 + index * 0.1}
                distance={12}
              >
                <h3 className="eyebrow text-[11px]">{section.label}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {section.links.map((link) => {
                    const internal = link.href.startsWith('/');
                    return (
                      <li key={link.title}>
                        {internal ? (
                          <Link to={link.href} className={LINK_CLS}>
                            {link.title}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            target={
                              link.href.startsWith('http')
                                ? '_blank'
                                : undefined
                            }
                            rel="noreferrer noopener"
                            className={LINK_CLS}
                          >
                            {link.icon && (
                              <link.icon aria-hidden className="size-4" />
                            )}
                            {link.title}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bottom rule: attribution line. */}
        <div className="eyebrow mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[10px]">
          <span>{t('footer.credit')}</span>
          <span dir="ltr">yosiart.vercel.app</span>
        </div>
      </div>
    </footer>
  );
}
