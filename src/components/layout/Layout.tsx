import Header from './Header';
import Footer from './Footer';
import PaperBackground from '../fx/PaperBackground';
import AnimatedOutlet from '../fx/AnimatedOutlet';
import ScrollToTop from '../fx/ScrollToTop';

/**
 * Root layout. Sticky header, page content via AnimatedOutlet (cross-fade
 * route transitions), footer below. PaperBackground sits behind everything
 * via -z-10 — paper texture + scattered ink strokes for the notebook feel.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <PaperBackground />
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
    </div>
  );
}
