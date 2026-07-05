import { useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Header from './Header';
import Footer from './Footer';
import AnimatedOutlet from '../fx/AnimatedOutlet';
import ScrollToTop from '../fx/ScrollToTop';

/**
 * Root layout. Sticky header, page content via AnimatedOutlet (cross-fade
 * route transitions), footer below.
 *
 * The landing ('/') is currently a blank canvas — just the full-screen
 * animation — so we hide the header + footer there while we rebuild it
 * element-by-element. Every other route keeps the full chrome.
 */
export default function Layout() {
  const path = useLocation().pathname;
  const isLanding = path === '/' || path === '/navbar-demo';
  return (
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
      {!isLanding && <Header />}
      <main id="main" className="flex-1">
        <AnimatedOutlet />
      </main>
      {!isLanding && <Footer />}
      {/* Vercel Analytics — pageviews + referrers, privacy-friendly
          (no cookies, no consent banner needed). Active only on the
          live yosiart.vercel.app deployment; the scripts no-op during
          dev / preview. */}
      <Analytics />
      {/* Vercel Speed Insights — Core Web Vitals from real visitors.
          Same conditions as Analytics above. */}
      <SpeedInsights />
    </div>
  );
}
