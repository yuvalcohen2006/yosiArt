import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import LanguageToggle from '@/components/layout/LanguageToggle';
import { useLocale } from '@/hooks/useLocale';
import { NAV_LIFT } from '@/components/ui/nav-lift';
import { pickLocale } from '@/lib/pickLocale';
import { WHATSAPP_NUMBER } from '@/lib/contact';
import { urlFor } from '@/sanity/imageUrl';
import type { Category, SanityImage } from '@/sanity/types';

// Adapted from the provided shadcn "Tabnavbar" demo: next/link -> plain <a>
// (Vite/React-Router), our fonts + palette, real logo, an EN/HE toggle, and
// labels wired to i18n so the toggle switches the nav language.

/**
 * The collections promoted to the top of the Works dropdown, by slug. Editing
 * this list re-orders the menu without touching Sanity; any slug that doesn't
 * exist is simply skipped, and if none match we fall back to the natural order.
 */
const HOT_CATEGORY_SLUGS = ['abstracts', 'jewish-and-spiritual-art', 'pop-realism'];

/** The plain page links that follow the Works dropdown. */
const NAV_PAGES = [
  { to: '/about', labelKey: 'nav.about' },
  { to: '/contact', labelKey: 'nav.contact' },
] as const;

/** One row in the phone drawer. `min-h-11` meets the WCAG 2.5.5 target size,
 *  and `text-start` follows the reading direction so Hebrew sets from the
 *  right without a mirrored copy of the markup. */
const MOBILE_LINK =
  'flex min-h-11 items-center rounded-md px-2 text-start font-sans text-base font-medium text-ink transition-colors hover:bg-mist';

export default function Tabnavbar({
  hidden = false,
  categories = [],
  featuredImage,
}: {
  /** Lifts the bar out of frame — used while the painter's-world film owns
   *  the screen, so it can run edge to edge. */
  hidden?: boolean;
  /** Real collections from Sanity. When provided they fill the "Works"
   *  dropdown; without them it still links straight to /works. */
  categories?: Category[];
  /** First image of the home hero carousel — the dropdown's featured tile. */
  featuredImage?: SanityImage | null;
}) {
  const { t, locale } = useLocale();
  const path = useLocation().pathname;

  // The three promoted collections, in HOT_CATEGORY_SLUGS order, with any
  // gaps back-filled from the remaining collections so the menu is never short.
  const hottest = React.useMemo(() => {
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    const picked = HOT_CATEGORY_SLUGS.map((s) => bySlug.get(s)).filter(
      (c): c is Category => Boolean(c),
    );
    const rest = categories.filter((c) => !picked.includes(c));
    return [...picked, ...rest].slice(0, 3);
  }, [categories]);

  const featuredUrl = featuredImage
    ? urlFor(featuredImage).width(560).height(700).fit('crop').auto('format').url()
    : null;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t('contact.generalWhatsappMessage'),
  )}`;

  // Phone drawer. Closed on every route change, so tapping a link never leaves
  // the menu hanging open over the page you just navigated to.
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const burgerRef = React.useRef<HTMLButtonElement>(null);
  const mobilePanelRef = React.useRef<HTMLDivElement>(null);
  const closeMobile = React.useCallback(() => setMobileOpen(false), []);
  React.useEffect(() => setMobileOpen(false), [path]);

  // Escape closes it and returns focus to the button that opened it. Not the
  // full `useDialog` trap: this panel is in the document flow directly under
  // the bar rather than an overlay, so trapping focus inside it would be
  // wrong — Tab should continue into the page, which is exactly where the
  // content below the menu is.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);
  // Products opens on click, not hover (see navigation-menu.tsx). Controlled so
  // a pointer-down anywhere outside the navbar closes it.
  const [menuValue, setMenuValue] = React.useState('');
  const navRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (!menuValue) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuValue('');
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuValue]);
  return (
    <nav
      ref={navRef}
      className={cn(
        'sticky top-0 z-40 border-b border-line bg-white font-sans',
        'transition-[transform,opacity] duration-500 ease-out',
        hidden && '-translate-y-full opacity-0',
      )}
    >
      {/*
        MOBILE / DESKTOP SPLIT — the rule for this whole file.

        Desktop must not move by a pixel, so every mobile-only style is written
        as a `max-md:` variant or lives inside a `md:hidden` element. Both
        compile to `@media (max-width: 767.98px)`, which cannot match at the
        md breakpoint or above. Base (unprefixed) utilities apply at ALL widths
        in Tailwind's mobile-first model, so changing one WOULD move desktop —
        that is the trap, and `max-md:` is how this file avoids it.

        Before this, the full desktop bar rendered on phones: a 68px signature,
        three nav items, a language toggle and a WhatsApp button, inside 64px
        of horizontal padding. On a 375px screen that overflows and takes the
        page with it.
      */}
      <div className="flex w-full items-center justify-between px-8 py-4 max-md:px-4 max-md:py-2">
        <div className="flex items-center gap-6">
          {/* Logo flush to the start; nav follows it. Routing alone isn't
              enough here: on the landing page the link target IS the current
              route, so React Router does nothing and the click appears dead
              halfway down the page. Scroll home explicitly in that case. */}
          <Link
            to="/"
            aria-label={t('nav.homeAria')}
            className="flex items-center"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({
                  top: 0,
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                    .matches
                    ? 'auto'
                    : 'smooth',
                });
              }
            }}
          >
            <img
              src="/signature.png"
              alt="יוסי כהן"
              className="h-[4.25rem] w-auto mix-blend-multiply max-md:h-12"
            />
          </Link>
          {/* The desktop menu. Hidden on phones, where the drawer below takes
              over — the dropdown alone is 460-580px wide. */}
          <NavigationMenu
            value={menuValue}
            onValueChange={setMenuValue}
            className="max-md:hidden"
          >
            <NavigationMenuList>
              {/* Works — opens onto the real collections from Sanity. */}
              <NavigationMenuItem value="works">
                {/* The accent hover is stated here as well as in the shared
                    trigger style: Radix stamps `data-state` on this element,
                    and the `data-[state=...]` rules in that style match with
                    higher specificity than a bare `hover:`, so the hover
                    colour could lose to them. Repeating it keeps the label
                    lighting up like every other nav item. */}
                <NavigationMenuTrigger className="transition-colors duration-200 hover:text-accent-ink data-[state=closed]:hover:text-accent-ink data-[state=open]:text-accent-ink">
                  {t('nav.works')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-4 p-6 md:w-[460px] lg:w-[580px] lg:grid-cols-[.8fr_1fr]">
                    {/* Featured painting — the first artwork from the home
                        hero carousel, so the menu always leads with whatever
                        Yosi has front-and-centre in Sanity. */}
                    <NavigationMenuLink asChild>
                      <Link
                        to="/works"
                        onClick={() => setMenuValue('')}
                        /* Dark surface: artwork under a near-black scrim. The
                           blurb is text-flame-300, which high contrast would
                           otherwise drive to near-black on near-black. */
                        data-surface="dark"
                        className="group/feat relative flex select-none flex-col justify-end overflow-hidden rounded-md bg-muted no-underline"
                      >
                        {featuredUrl ? (
                          <img
                            src={featuredUrl}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-gallery group-hover/feat:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted" />
                        )}
                        {/* Scrim so the label stays legible over any artwork. */}
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-gradient-to-t from-flame-900/85 via-flame-900/25 to-transparent"
                        />
                        <div className="relative p-4">
                          <div className="font-display text-lg font-semibold text-flame-50">
                            {t('works.title')}
                          </div>
                          <p className="mt-1 text-sm leading-tight text-flame-300">
                            {t('nav.featuredBlurb')}
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>

                    <div>
                      <p className="px-3 pb-1 font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-slate">
                        {t('nav.hottestCategories')}
                      </p>
                      <ul>
                        {hottest.length > 0 ? (
                          hottest.map((c) => (
                            <ListItem
                              key={c._id}
                              to={`/works/${c.slug}`}
                              title={pickLocale(c.title, locale)}
                              onNavigate={() => setMenuValue('')}
                            >
                              {pickLocale(c.description, locale)}
                            </ListItem>
                          ))
                        ) : (
                          <ListItem
                            to="/works"
                            title={t('works.title')}
                            onNavigate={() => setMenuValue('')}
                          >
                            {t('home.bodiesOfWork')}
                          </ListItem>
                        )}
                      </ul>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {/* NavLink, not Link: it stamps `aria-current="page"` on the
                  active route by itself, so screen-reader users are told where
                  they already are (WCAG 2.4.8). The accent colour carries the
                  same information visually.

                  The active class is computed here rather than via NavLink's
                  `className={({isActive}) => ...}` render prop. Radix's
                  `asChild` merges className by CONCATENATING STRINGS, so a
                  function argument gets `String(fn)`'d and the literal source
                  text of the arrow function lands in the DOM as a class —
                  which is what was happening, silently, with the styling never
                  applying. A plain string is the only safe form under Slot. */}
              {NAV_PAGES.map(({ to, labelKey }) => (
                <NavigationMenuItem key={to}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <NavLink
                      to={to}
                      className={path === to ? 'text-accent-ink' : undefined}
                    >
                      {t(labelKey)}
                    </NavLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          {/* Was a dead "Sign In" button — this project has no accounts and
              never will, so it pointed nowhere. Repurposed as the one action
              an interested visitor actually wants: open WhatsApp to Yosi,
              pre-filled with the general enquiry message. Distinct from the
              plain Contact nav link, which opens the contact page. */}
          <Button
            asChild
            variant="outline"
            className={cn('text-base font-medium max-md:hidden', NAV_LIFT)}
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer noopener"
            >
              {t('contact.whatsapp')}
            </a>
          </Button>

          {/* Phone-only menu button. 44x44 to clear the WCAG 2.5.5 target
              size, which the desktop nav's text links do not need to worry
              about but a lone icon does. */}
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={t(mobileOpen ? 'nav.closeMenu' : 'nav.openMenu')}
            className="hidden h-11 w-11 place-items-center rounded-md text-ink transition-colors hover:bg-ink/5 max-md:grid"
          >
            {mobileOpen ? (
              <X aria-hidden className="h-6 w-6" />
            ) : (
              <Menu aria-hidden className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* ── Phone drawer ────────────────────────────────────────────────────
          `md:hidden` on the wrapper, so none of this exists on desktop. It
          drops from under the bar rather than sliding from the side: the bar
          is already sticky at the top, so the menu reads as an extension of
          it, and there is no direction to mirror in Hebrew.

          Height-animated via a grid-rows trick rather than max-height, so the
          panel is exactly as tall as its content at any font scale — the a11y
          widget can push text to 150%, which a hardcoded max-height would
          clip. */}
      <div
        id="mobile-nav"
        ref={mobilePanelRef}
        /* `visibility` is in the transition list on purpose. A collapsed
           grid-rows-[0fr] panel is only visually clipped — its links stay in
           the tab order, so a keyboard user Tabs into a menu they cannot see.
           visibility:hidden removes them. Per spec visibility only flips at
           100% progress when interpolated, so the links stay visible for the
           whole collapse and disappear exactly as it finishes. */
        className={cn(
          'grid overflow-hidden border-t bg-white md:hidden',
          'transition-[grid-template-rows,visibility] duration-300 ease-out',
          mobileOpen
            ? 'visible grid-rows-[1fr] border-t-line'
            : 'invisible grid-rows-[0fr] border-t-transparent',
        )}
      >
        <div className="min-h-0">
          <div className="flex flex-col px-4 pb-4 pt-2">
            <NavLink
              to="/works"
              onClick={closeMobile}
              className={cn(MOBILE_LINK, path === '/works' && 'text-accent-ink')}
            >
              {t('nav.works')}
            </NavLink>

            {/* The collections, indented under Works — the desktop dropdown's
                featured tile and blurbs are deliberately dropped here: on a
                phone they cost a lot of height for little help. */}
            {hottest.length > 0 && (
              <ul className="mb-1 flex flex-col border-s border-line ps-3">
                {hottest.map((c) => (
                  <li key={c._id}>
                    <NavLink
                      to={`/works/${c.slug}`}
                      onClick={closeMobile}
                      className={cn(
                        MOBILE_LINK,
                        'py-2 text-[15px] text-slate',
                        path === `/works/${c.slug}` && 'text-accent-ink',
                      )}
                    >
                      {pickLocale(c.title, locale)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}

            {NAV_PAGES.map(({ to, labelKey }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMobile}
                className={cn(MOBILE_LINK, path === to && 'text-accent-ink')}
              >
                {t(labelKey)}
              </NavLink>
            ))}

            <Button
              asChild
              variant="outline"
              className="mt-3 h-11 w-full text-base font-medium"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                onClick={closeMobile}
              >
                {t('contact.whatsapp')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** A single collection row inside the Works dropdown. Routes client-side and
 *  closes the menu on the way out. */
function ListItem({
  to,
  title,
  children,
  className,
  onNavigate,
}: {
  to: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          onClick={onNavigate}
          className={cn(
            /* Hover: a light grey fill plus a 2px lift, so the whole tile
               responds rather than just the title changing colour. The lift is
               a transform (compositor-only) and the row reserves no extra
               space for it, so neighbours never shift. */
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline',
            'transition-[color,background-color,transform,box-shadow] duration-200 ease-out',
            'hover:-translate-y-0.5 hover:bg-mist hover:text-accent-ink hover:shadow-sm',
            'focus-visible:-translate-y-0.5 focus-visible:bg-mist focus-visible:text-accent-ink',
            'active:translate-y-0 active:shadow-none',
            className,
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            /* One line, clipped. These come from Sanity and run to a full
               paragraph; at two lines the tallest tile stretched the dropdown
               and the three rows stopped matching. `line-clamp-1` keeps every
               tile the same height whatever the editor writes. */
            <p className="line-clamp-1 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
