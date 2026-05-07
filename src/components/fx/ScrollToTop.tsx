import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll to (0,0) on every pathname change. Without this,
 * navigating from a deep-scrolled page to another page leaves the new
 * page mounted at the previous scroll offset.
 *
 * Uses `useLayoutEffect` so the reset runs synchronously before the new
 * page paints, avoiding a visible flash at the old offset. We pass the
 * options form with `behavior: 'auto'` so the global `scroll-behavior:
 * smooth` rule is bypassed — page navigation should snap, not animate.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}
