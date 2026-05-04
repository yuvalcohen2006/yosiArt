import { useEffect, useState } from 'react';
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
 * Slide-reveal nav link. Two stacked copies of the label sit inside a
 * clipped container; on hover (or active state) the stack translates up
 * and the second copy slides into the visible window. The first copy is
 * muted ink, the second is full ink — so the swap reads as a colour shift
 * with a small physical motion, not just a static fade.
 */
const navContainerClass =
  'group relative inline-block h-[1.05em] overflow-hidden leading-none align-middle text-[13px] uppercase tracking-[0.176em]';

const navInnerClass = (isActive: boolean) =>
  [
    'block transition-transform duration-[450ms] ease-gallery',
    isActive ? '-translate-y-1/2' : 'group-hover:-translate-y-1/2',
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

  return (
    <>
      <header
        className={[
          'sticky top-0 z-40 w-full transition-all duration-300 ease-gallery',
          scrolled
            ? 'bg-paper/85 backdrop-blur-md border-b border-mist/70'
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
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-9">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navContainerClass}
              >
                {({ isActive }) => (
                  <span className={navInnerClass(isActive)}>
                    <span className="block text-ink/55 group-hover:text-ink transition-colors duration-300">
                      {t(item.key)}
                    </span>
                    <span aria-hidden className="block text-ink">
                      {t(item.key)}
                    </span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop toggles */}
          <div className="hidden md:flex items-center gap-6">
            <LanguageToggle />
            <span aria-hidden className="block h-3 w-px bg-mist" />
            <CurrencyToggle />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex flex-col items-end justify-center gap-1.5 p-2 -mr-2"
          >
            <span
              className={[
                'block h-px w-6 bg-ink transition-transform duration-300 ease-gallery origin-right',
                mobileOpen ? '-rotate-45 -translate-y-px' : '',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px bg-ink transition-all duration-300 ease-gallery',
                mobileOpen ? 'w-6 opacity-0' : 'w-4 opacity-100',
              ].join(' ')}
            />
            <span
              className={[
                'block h-px w-6 bg-ink transition-transform duration-300 ease-gallery origin-right',
                mobileOpen ? 'rotate-45 translate-y-px' : '',
              ].join(' ')}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        aria-hidden={!mobileOpen}
        className={[
          'md:hidden fixed inset-0 z-30 bg-paper transition-opacity duration-300 ease-gallery',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <nav className="h-full flex flex-col items-center justify-center gap-10 pt-10">
          {NAV.map((item, i) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  'font-display text-4xl tracking-tight transition-all duration-500 ease-gallery',
                  isActive ? 'text-ink' : 'text-ink/55 hover:text-ink',
                  mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
                ].join(' ')
              }
              style={{ transitionDelay: mobileOpen ? `${100 + i * 80}ms` : '0ms' }}
            >
              {t(item.key)}
            </NavLink>
          ))}
          <div className="mt-6 flex items-center gap-6">
            <LanguageToggle />
            <span aria-hidden className="block h-3 w-px bg-mist" />
            <CurrencyToggle />
          </div>
        </nav>
      </div>
    </>
  );
}
