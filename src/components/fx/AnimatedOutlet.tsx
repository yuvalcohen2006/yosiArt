import { AnimatePresence, motion } from 'framer-motion';
import {
  useLocation,
  useOutlet,
  UNSAFE_DataRouterStateContext,
  UNSAFE_LocationContext,
} from 'react-router-dom';
import { useContext, useState } from 'react';

/**
 * Cross-fade route transition. The matched route element is wrapped in a Framer
 * Motion div keyed by pathname, so AnimatePresence runs the exit animation on
 * the outgoing page before mounting the next one. `mode="wait"` keeps the two
 * from ever overlapping on the body's white background.
 *
 * `initial={true}` lets the fade run on first paint too (load + refresh), not
 * only on subsequent navigations.
 *
 * Why the frozen child — this is what kills the "ghost traces of dead screens"
 * on back-navigation. During its exit fade, the outgoing page is still mounted
 * (~180ms) while the router has ALREADY moved to the next route. Three things
 * feed that page, and all three must be pinned to the moment it was captured,
 * or the fading page re-renders as something else and flashes through:
 *
 *   1. `useOutlet()` — read live, it returns the CURRENTLY matched element, so
 *      the outgoing frame would render the INCOMING page (the original ghost:
 *      the whole destination showing through the old page). Frozen once here.
 *   2. the data-router state — `useLoaderData()` reads it from context, and
 *      context changes bypass any memo/freeze boundary above the component. Once
 *      we leave `/work/:slug` its loader data is gone, so the painting page
 *      would drop into its "Painting not found" branch and flash a 404 through
 *      the fade. Frozen and re-provided below.
 *   3. the location — so `useLocation()`/`useParams()` inside the page resolve
 *      against the route it was captured on, not the one we're heading to.
 *
 * Each keyed instance therefore animates its OWN page, with its OWN data, from
 * mount to unmount. The frozen outlet element already carries its route's
 * `RouteContext`; we only need to re-pin the two contexts it reads through.
 */
export default function AnimatedOutlet() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={true}>
      <RouteFade key={location.pathname} />
    </AnimatePresence>
  );
}

function RouteFade() {
  // useState only ever reads its initial value, so each of these is snapshotted
  // on this instance's first render and can't be swapped mid-exit.
  const [outlet] = useState(useOutlet());
  const [routerState] = useState(useContext(UNSAFE_DataRouterStateContext));
  const [locationCtx] = useState(useContext(UNSAFE_LocationContext));
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <UNSAFE_DataRouterStateContext.Provider value={routerState}>
        <UNSAFE_LocationContext.Provider value={locationCtx}>
          {outlet}
        </UNSAFE_LocationContext.Provider>
      </UNSAFE_DataRouterStateContext.Provider>
    </motion.div>
  );
}
