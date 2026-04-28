import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';

/**
 * Cross-fade route transition. Renders the matched route's element wrapped
 * in a Framer Motion div keyed by pathname, so AnimatePresence can run the
 * exit animation on the outgoing page before mounting the next one.
 *
 * `mode="wait"` ensures the exit completes before the new page enters,
 * avoiding overlap at the body's white background.
 */
export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
