import Header from './Header';
import Footer from './Footer';
import ParticleField from '../fx/ParticleField';
import CursorGlow from '../fx/CursorGlow';
import AnimatedOutlet from '../fx/AnimatedOutlet';

/**
 * Root layout. Sticky header, page content via AnimatedOutlet (cross-fade
 * route transitions), footer below. ParticleField sits behind everything
 * via -z-10; CursorGlow rides above content but is pointer-events: none
 * so it never intercepts clicks.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ParticleField />
      <CursorGlow />
      <Header />
      <main className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  );
}
