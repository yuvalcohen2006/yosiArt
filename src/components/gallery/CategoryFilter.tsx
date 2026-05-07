import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { useCategories } from '@/hooks/useCategories';
import { pickLocale } from '@/lib/pickLocale';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center text-[11px] uppercase tracking-[0.176em] px-4 py-2 rounded-full border transition-colors duration-300',
    isActive
      ? 'bg-ink text-paper border-ink'
      : 'border-mist text-ink/65 hover:border-teal hover:text-teal',
  ].join(' ');

// Distance over which the white stripe transitions from fully visible to
// gone, *before* it would otherwise stick under the header.
const FADE_LEAD_IN = 100;
// Fallback used until the real header is measured — close enough to its
// scrolled-state height that there's no visible jump on first paint.
const HEADER_FALLBACK = 88;
// Soft mask gradient that feathers the stripe's left/right edges so it
// doesn't end in a hard line against the page.
const EDGE_MASK =
  'linear-gradient(to right, transparent 0%, black 9%, black 91%, transparent 100%)';

/**
 * Sticky filter bar. "All" links to /works (exact match — won't stay
 * highlighted when a sub-category is active). Each category links to
 * /works/:slug and highlights when the URL matches.
 *
 * The white background is its own motion layer that fades out as the bar
 * approaches the header — so the stripe doesn't ride pinned-to-the-nav
 * for the rest of the scroll. Buttons stay where they are; only the
 * stripe behind them disappears.
 *
 * Sticky offset and fade trigger are both keyed off the header's actual
 * measured height (via ResizeObserver), so the bar always docks flush to
 * the header regardless of its scrolled / unscrolled padding state.
 */
export default function CategoryFilter() {
  const { t, locale } = useLocale();
  const state = useCategories();
  const categories = state.status === 'success' ? state.data : [];

  const navRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(HEADER_FALLBACK);

  // Single motion value drives both the stripe and the buttons — they
  // fade in lockstep as the bar approaches the header.
  const barOpacity = useMotionValue(1);
  // Once the buttons are mostly faded out, ignore pointer events so they
  // can't be clicked while invisible. Threshold sits below 0.1 so the
  // very tail of the fade still accepts clicks.
  const barPointerEvents = useTransform(barOpacity, (v) =>
    v > 0.1 ? 'auto' : 'none',
  );

  // Track the header's live height so the filter docks against its real
  // bottom edge instead of a hardcoded constant. The header's padding
  // shrinks once the user starts scrolling, so the value changes.
  useLayoutEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const update = () => setHeaderH(header.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      const el = navRef.current;
      if (!el) return;
      // Distance from the viewport top to the bar's current top edge.
      // When sticky activates, this clamps to headerH. We start fading
      // FADE_LEAD_IN px before that and reach zero at exactly the
      // activation point.
      const top = el.getBoundingClientRect().top;
      const start = headerH + FADE_LEAD_IN;
      const end = headerH;
      const t = Math.max(0, Math.min(1, (top - end) / (start - end)));
      barOpacity.set(t);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [barOpacity, headerH]);

  return (
    <nav
      ref={navRef}
      style={{ top: headerH }}
      className="sticky z-20 py-3.5 mb-10 transition-[top] duration-300 ease-gallery"
      aria-label="Categories"
    >
      <motion.div
        aria-hidden
        style={{
          opacity: barOpacity,
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
        className="absolute inset-0 bg-paper/80 backdrop-blur-md border-b border-mist/60 pointer-events-none"
      />
      <motion.div
        style={{ opacity: barOpacity, pointerEvents: barPointerEvents }}
        className="relative px-4 flex flex-wrap items-center gap-2"
      >
        <NavLink to="/works" end className={linkClass}>
          {t('works.all')}
        </NavLink>
        {categories.map((c) => (
          <NavLink
            key={c._id}
            to={`/works/${c.slug}`}
            className={linkClass}
          >
            {pickLocale(c.title, locale, c.slug)}
          </NavLink>
        ))}
      </motion.div>
    </nav>
  );
}
