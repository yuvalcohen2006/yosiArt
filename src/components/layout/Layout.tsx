import { useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Tabnavbar from '../ui/navbar';
import Footer from './Footer';
import { useLocale } from '@/hooks/useLocale';
import { useCategories } from '@/hooks/useCategories';
import { useHomeMedia } from '@/hooks/useHomeMedia';
import { usePreloadGalleryImages } from '@/hooks/usePreloadGalleryImages';
import AnimatedOutlet from '../fx/AnimatedOutlet';
import ScrollToTop from '../fx/ScrollToTop';
import AccessibilityWidget from '../a11y/AccessibilityWidget';
import { useStopMotion } from '../a11y/useStopMotion';

/**
 * Root layout. Sticky header, page content via AnimatedOutlet (cross-fade
 * route transitions), footer below, and the floating accessibility widget
 * on every page.
 *
 * Per-route chrome:
 *   - '/' (landing) renders its own Tabnavbar, so the shared one is
 *     hidden there — but it DOES get the shared Footer.
 *
 * The whole tree sits inside a framer-motion <MotionConfig> whose
 * reducedMotion flips to "always" when the accessibility widget's
 * "stop animations" mode is on — that reaches the JS-driven framer
 * animations (route fades, footer reveals, focus-rail springs) that the
 * CSS overrides in index.css cannot touch.
 */
export default function Layout() {
  const path = useLocation().pathname;
  const isLanding = path === '/';
  const stopMotion = useStopMotion();
  const { t } = useLocale();
  // Warms the wall's card images once the browser goes idle, so reaching /works
  // — or coming back to it — paints from cache. Best-effort and self-limiting;
  // see the hook for the bandwidth guards.
  usePreloadGalleryImages();
  const categoriesState = useCategories();
  const categories =
    categoriesState.status === 'success' ? categoriesState.data : [];
  // The Works dropdown's featured tile. Fetched here rather than read from a
  // loader because loader data is scoped per route and Layout is the parent —
  // it cannot see `/`'s. Skipped on the landing page, which has its own navbar
  // fed from that loader. Missing this is why the tile was a flat grey
  // gradient on About, Contact and Works.
  const homeMediaState = useHomeMedia(!isLanding);
  const featuredImage =
    homeMediaState.status === 'success'
      ? (homeMediaState.data?.heroImages?.[0] ?? null)
      : null;
  return (
    <MotionConfig reducedMotion={stopMotion ? 'always' : 'user'}>
      <div className="min-h-screen flex flex-col">
        {/* Scrolling is the browser's own, deliberately. A smoothing engine
            (Lenis) used to sit between the wheel and the page site-wide and
            made every page feel laggy and "stuck"; only the painter's-world
            section wants custom scroll behaviour, and it implements that
            itself. Do not reintroduce a global scroll hijacker. */}
        <ScrollToTop />
        {/* Skip-to-content — hidden until keyboard focus, then jumps the
            user past the header straight into the main page content.
            Lets screen-reader / keyboard users avoid tabbing through
            the nav on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:text-sm focus:uppercase focus:tracking-[0.176em] focus:rounded-md"
        >
          {t('a11y.skipToContent')}
        </a>
        {/* One navbar for the whole site. The landing renders its own copy —
            it has the collections from its route loader, and the painter's
            film needs to lift the bar out of frame — so this covers every
            other page, pulling the same collections client-side so the Works
            dropdown is identical wherever you are. */}
        {!isLanding && (
          <Tabnavbar categories={categories} featuredImage={featuredImage} />
        )}
        <main id="main" className="flex-1">
          <AnimatedOutlet />
        </main>
        <Footer />
        <AccessibilityWidget />
        {/* Vercel Analytics — pageviews + referrers, privacy-friendly
            (no cookies, no consent banner needed). Active only on the
            live yosiart.vercel.app deployment; the scripts no-op during
            dev / preview. */}
        <Analytics />
        {/* Vercel Speed Insights — Core Web Vitals from real visitors.
            Same conditions as Analytics above. */}
        <SpeedInsights />
      </div>
    </MotionConfig>
  );
}
