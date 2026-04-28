import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

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
 */
export default function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  distance = 24,
  amount = 0.2,
  className,
}: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
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
