import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ParticleField from '../fx/ParticleField';

/**
 * Root layout. Sticky header, content via Outlet, footer below.
 * ParticleField sits behind everything via -z-10.
 * Page transitions land in milestone 4.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ParticleField />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
