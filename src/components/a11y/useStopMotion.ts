import { useEffect, useState } from 'react';

/**
 * Fired on `window` by the accessibility widget whenever preferences are
 * (re)applied, so JS-driven animation (framer-motion, GSAP, carousel timers)
 * can react to the "stop animations" toggle immediately — CSS overrides
 * alone can't reach inline-style animation engines.
 */
export const A11Y_MOTION_EVENT = 'yosiart:a11y-motion';

/** True when the widget's "stop animations" mode is active right now. */
export function motionStopped(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('a11y-stop-motion')
  );
}

/**
 * Reactive form of `motionStopped()` — re-renders the consumer when the
 * accessibility widget toggles the mode. SSG renders `false`; the client
 * syncs on mount (the pre-paint script in index.html may have applied the
 * class before hydration).
 */
export function useStopMotion(): boolean {
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    const sync = () => setStopped(motionStopped());
    sync();
    window.addEventListener(A11Y_MOTION_EVENT, sync);
    return () => window.removeEventListener(A11Y_MOTION_EVENT, sync);
  }, []);
  return stopped;
}
