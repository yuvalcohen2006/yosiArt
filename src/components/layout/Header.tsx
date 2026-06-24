import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LanguageToggle from './LanguageToggle';
import CurrencyToggle from './CurrencyToggle';
import { useLocale } from '@/hooks/useLocale';

const NAV: { to: string; key: 'nav.works' | 'nav.about' | 'nav.contact' }[] = [
  { to: '/works', key: 'nav.works' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
];

/**
 * Nav link styled as a shadcn-style pill: a rounded item that lifts a soft
 * tint on hover and stays tinted when its route is active. Over the dark
 * landing hero (`onDark`) it flips to light-on-dark so it stays legible.
 */
const navLinkClass = (isActive: boolean, onDark: boolean) =>
  [
    'rounded-full px-4 py-2 font-display text-sm font-medium tracking-wide transition-colors duration-200',
    onDark
      ? isActive
        ? 'bg-white/15 text-sea-100'
        : 'text-sea-100/75 hover:bg-white/10 hover:text-sea-100'
      : isActive
        ? 'bg-ink/[0.06] text-ink'
        : 'text-slate hover:bg-ink/[0.05] hover:text-ink',
  ].join(' ');

export default function Header() {
  const { t } = useLocale();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Make the closed mobile-menu fully inert: `pointer-events-none` +
  // `aria-hidden` already cover mouse and screen-reader visibility,
  // but Tab can still focus through it. The `inert` attribute removes
  // those links from the focus order. Set imperatively because React
  // 18 doesn't type `inert` on HTML props.
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mobileMenuRef.current;
    if (!el) return;
    if (mobileOpen) el.removeAttribute('inert');
    else el.setAttribute('inert', '');
  }, [mobileOpen]);

  // On the landing page, the header floats over the dark deep-sea hero until
  // the user scrolls (or opens the mobile menu, whose overlay is light). In
  // that "over hero" state the chrome flips to light-on-dark so it's legible.
  const onHero =
    location.pathname === '/' && !scrolled && !mobileOpen;
  const barColor = onHero ? 'bg-sea-100' : 'bg-ink';

  return (
    <>
      <header
        className={[
          'sticky top-0 z-40 w-full transition-all duration-300 ease-gallery',
          scrolled
            ? 'bg-paper/85 backdrop-blur-md border-b border-line'
            : 'bg-paper/0 border-b border-transparent',
        ].join(' ')}
      >
        <div
          className={[
            'mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10',
            'transition-[padding] duration-300 ease-gallery',
            scrolled ? 'py-3' : 'py-5',
          ].join(' ')}
        >
          <Logo onDark={onHero} />

          {/* Desktop nav — pills sit close together like a shadcn nav. */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navLinkClass(isActive, onHero)}
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          {/* Desktop toggles — colour inherited so they flip over the hero. */}
          <div
            className={[
              'hidden md:flex items-center gap-6 transition-colors duration-300',
              onHero ? 'text-sea-100' : 'text-ink',
            ].join(' ')}
          >
            <LanguageToggle />
            <span
              aria-hidden
              className={[
                'block h-3 w-px',
                onHero ? 'bg-sea-100/30' : 'bg-mist',
              ].join(' ')}
            />
            <CurrencyToggle />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex flex-col items-end justify-center gap-1.5 p-2 -mr-2"
          >
            <span
              className={[
                'block h-px w-6 transition-transform duration-300 ease-gallery origin-right',
                barColor,
                mobileOpen ? '-rotate-45 -translate-y-px' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px transition-all duration-300 ease-gallery',
                barColor,
                mobileOpen ? 'w-6 opacity-0' : 'w-4 opacity-100',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px w-6 transition-transform duration-300 ease-gallery origin-right',
                barColor,
                mobileOpen ? 'rotate-45 translate-y-px' : '',
              ].join(' ')}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        ref={mobileMenuRef}
        aria-hidden={!mobileOpen}
        className={[
          'md:hidden fixed inset-0 z-30 bg-paper transition-opacity duration-300 ease-gallery',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <nav className="h-full flex flex-col items-stretch justify-center gap-6 px-10">
          {NAV.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  'group flex items-baseline gap-4 font-display font-black text-6xl tracking-tight leading-none transition-all duration-500 ease-gallery',
                  isActive ? 'text-ink' : 'text-ink/70 hover:text-ink',
                  mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
                ].join(' ')
              }
              style={{ transitionDelay: mobileOpen ? `${100 + i * 80}ms` : '0ms' }}
            >
              <span
                aria-hidden
                className="font-display text-sm font-medium tracking-[0.2em] text-accent self-start mt-2"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {t(item.key)}
            </NavLink>
          ))}
          <div className="mt-10 flex items-center gap-6">
            <LanguageToggle />
            <span aria-hidden className="block h-3 w-px bg-mist" />
            <CurrencyToggle />
          </div>
        </nav>
      </div>
    </>
  );
}
