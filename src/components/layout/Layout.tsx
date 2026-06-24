import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Header from './Header';
import Footer from './Footer';
import AuroraBackground from '../fx/AuroraBackground';
import AnimatedOutlet from '../fx/AnimatedOutlet';
import ScrollToTop from '../fx/ScrollToTop';

/**
 * Root layout. Sticky header, page content via AnimatedOutlet (cross-fade
 * route transitions), footer below. AuroraBackground sits behind everything
 * via -z-10 — an animated aurora gradient drifting over the paper surface.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <AuroraBackground />
      {/* Skip-to-content — hidden until keyboard focus, then jumps the
          user past the header straight into the main page content.
          Lets screen-reader / keyboard users avoid tabbing through
          the nav on every page. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:text-sm focus:uppercase focus:tracking-[0.176em] focus:rounded"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
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
