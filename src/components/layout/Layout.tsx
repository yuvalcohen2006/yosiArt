import Header from './Header';
import Footer from './Footer';
import PaperBackground from '../fx/PaperBackground';
import AnimatedOutlet from '../fx/AnimatedOutlet';

/**
 * Root layout. Sticky header, page content via AnimatedOutlet (cross-fade
 * route transitions), footer below. PaperBackground sits behind everything
 * via -z-10 — paper texture + scattered ink strokes for the notebook feel.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PaperBackground />
      <Header />
      <main className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  );
}
