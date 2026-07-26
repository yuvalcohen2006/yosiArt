import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import Reveal from '../fx/Reveal';
import { useLocale } from '@/hooks/useLocale';
import { EMAIL, INSTAGRAM_URL, WHATSAPP_NUMBER } from '@/lib/contact';
import { Spotlight, GridBackground, StageWash } from '../fx/Spotlight';

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

/** Column headings — no display serif down here, so the footer carries the
 *  same two typefaces as everything else. Set to match the landing's gallery
 *  plaque: a step larger, and light rather than bold, with the tracking opened
 *  up to keep thin uppercase legible. The two dark ends of the site should
 *  speak in the same voice. */
const HEADING_CLS =
  'font-sans text-base font-light uppercase tracking-[0.22em] text-flame-50';

/** Links sit a step up from the old 14px, in warm light grey so they read
 *  comfortably on the dark field, and take the accent on hover. */
const LINK_CLS =
  'inline-flex items-center gap-2 font-sans text-[15px] text-flame-300 transition-colors duration-300 hover:text-primary';

/**
 * Site footer — the landing's dark stage, reprised.
 *
 * The page ends the way it opened: near-black, lit by the same pastel
 * blue/pink washes and canvas grain, with light type over it. Four aligned
 * columns — the brand block, then site navigation, the Israeli legal pages,
 * and the real contact channels — all starting on one top line so the
 * signature sits level with the column headings. Each column reveals on
 * first scroll into view (via the shared Reveal wrapper, which keeps hidden
 * content inert until it appears).
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
    /* data-surface="dark" is load-bearing, not decorative: it is what tells the
       high-contrast mode to go WHITE here instead of near-black. Without it the
       footer renders #0a0a0a text on the #0a0a0a stage — invisible. See the
       high-contrast block in index.css. */
    <footer
      data-surface="dark"
      className="relative w-full overflow-hidden bg-stage text-flame-300"
    >
      {/* The same lighting the landing opens on, so the page closes in the
          room it started in — beams scaled down for a section a fraction of
          the hero's height, and slowed so the two are never in step.
          Decoration only; nothing here affects layout. */}
      {/* Same lighting order as the landing — wash, then beams, then the grid
          on top so the rim texture is not dimmed by what follows it. The grid
          is edge-masked here too, so the footer's middle is the same clean
          charcoal the hero's is, and the cursor torch is the same whisper of
          the landing's effect at a much lower intensity. */}
      <StageWash />
      <Spotlight
        width={380}
        height={760}
        smallWidth={170}
        translateY={-180}
        xOffset={70}
        duration={10}
      />
      <GridBackground interactive torchOpacity="0.09" />
      {/* Accent thread along the top edge, fading out at both ends. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      <div className="editorial-container relative z-10 pb-10 pt-16 lg:pt-20">
        {/* One grid for all four columns, so the signature's top edge sits on
            the same line as the column headings instead of floating free. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          <Reveal className="col-span-2 sm:col-span-3 lg:col-span-1" distance={12}>
            <Logo variant="footer" onDark />
            {/* Two sentences, two explicit lines. Left to wrap naturally
                (even with text-balance) the break landed mid-sentence, which
                read as a mistake; splitting them in the copy guarantees each
                sentence stays whole in both languages. */}
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-flame-300">
              <span className="block">{t('footer.taglineLine1')}</span>
              <span className="block">{t('footer.taglineLine2')}</span>
            </p>
          </Reveal>

          {sections.map((section, index) => (
            <Reveal key={section.label} delay={0.1 + index * 0.1} distance={12}>
              <h3 className={HEADING_CLS}>{section.label}</h3>
              <ul className="mt-5 space-y-3">
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
                            link.href.startsWith('http') ? '_blank' : undefined
                          }
                          rel="noreferrer noopener"
                          className={LINK_CLS}
                        >
                          {link.icon && (
                            <link.icon aria-hidden className="size-[18px]" />
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

        {/* Bottom rule: copyright + attribution. */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-flame-50/10 pt-6 font-sans text-[13px] text-flame-300/70">
          <span>
            © {year} YosiArt. {t('footer.rights')}
          </span>
          <span>{t('footer.credit')}</span>
        </div>
      </div>
    </footer>
  );
}
