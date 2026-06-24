import { motion, useReducedMotion } from 'framer-motion';

type Props = {
  text: string;
  className?: string;
  /** Seconds before the first character starts animating. */
  delay?: number;
  /** Seconds between consecutive character starts. */
  staggerPer?: number;
};

/**
 * Headline that reveals one character at a time with a staggered fade-up.
 * Works for both English (LTR) and Hebrew (RTL) — Array.from splits Unicode
 * cleanly, and in RTL the visual order naturally flows right-to-left
 * because character 0 sits on the right.
 *
 * Spaces are rendered as fixed-width empty spans rather than a literal space
 * inside an inline-block (which collapses to zero width and runs multi-word
 * headlines together).
 *
 * Accessibility: the parent span carries the full label; per-character spans
 * are aria-hidden so screen readers read the word, not 7 letters. Honours
 * prefers-reduced-motion by rendering the final state immediately.
 */
export default function AnimatedHeadline({
  text,
  className,
  delay = 0,
  staggerPer = 0.04,
}: Props) {
  const chars = Array.from(text);
  const reduce = useReducedMotion();
  return (
    <span className={className} aria-label={text}>
      {chars.map((c, i) =>
        c === ' ' ? (
          <span key={`${i}-sp`} aria-hidden className="inline-block w-[0.3em]" />
        ) : (
          <motion.span
            key={`${i}-${c}`}
            aria-hidden
            className="inline-block"
            initial={reduce ? false : { opacity: 0, y: '0.4em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    delay: delay + i * staggerPer,
                    duration: 0.7,
                    ease: [0.22, 0.61, 0.36, 1],
                  }
            }
          >
            {c}
          </motion.span>
        ),
      )}
    </span>
  );
}
