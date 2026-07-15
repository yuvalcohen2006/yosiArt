import { useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Header from './Header';
import Footer from './Footer';
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
 *   - '/' (landing) renders its own Tabnavbar, so the shared Header is
 *     hidden there — but it DOES get the shared Footer.
 *   - '/navbar-demo' is a chrome-free sandbox: no Header, no Footer.
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
  const isDemo = path === '/navbar-demo';
  const stopMotion = useStopMotion();
  return (
    <MotionConfig reducedMotion={stopMotion ? 'always' : 'user'}>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        {/* Skip-to-content — hidden until keyboard focus, then jumps the
            user past the header straight into the main page content.
            Lets screen-reader / keyboard users avoid tabbing through
            the nav on every page. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:text-sm focus:uppercase focus:tracking-[0.176em] focus:rounded-md"
        >
          Skip to content
        </a>
        {!isLanding && !isDemo && <Header />}
        <main id="main" className="flex-1">
          <AnimatedOutlet />
        </main>
        {!isDemo && <Footer />}
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
