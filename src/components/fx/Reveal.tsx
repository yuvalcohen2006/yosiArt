import { motion, useInView } from 'framer-motion';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  /** Seconds. */
  duration?: number;
  /** Travel distance in px. 0 disables the upward slide. */
  distance?: number;
  className?: string;
  /** Trigger when this fraction of the element is in view. Default 0.2. */
  amount?: number;
};

/**
 * Generic scroll-reveal wrapper. Fades up from `distance` px below its
 * resting position once the element enters the viewport, then stays put.
 *
 * Skip the wrapper for above-the-fold elements that should be visible on
 * first paint — `Reveal` is for things that should arrive on scroll.
 *
 * Respects `prefers-reduced-motion` automatically (Framer ships this).
 *
 * While the children are still at opacity 0 (haven't entered view yet)
 * the wrapper carries `inert`, so links and buttons inside can't be
 * tab-focused or clicked through invisible regions. Cleared as soon as
 * the element scrolls into view.
 */
export default function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  distance = 24,
  amount = 0.2,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) el.removeAttribute('inert');
    else el.setAttribute('inert', '');
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{
        duration,
        delay,
        ease: [0.22, 0.61, 0.36, 1], // matches the Tailwind `ease-gallery` curve.
      }}
    >
      {children}
    </motion.div>
  );
}
