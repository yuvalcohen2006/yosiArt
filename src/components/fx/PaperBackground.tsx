import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Notebook-style background — a tiled paper texture with hand-drawn-feel
 * ink stroke decorations scattered around the viewport edges. Static after
 * mount; gentle fade-in stagger on first paint.
 *
 * Replace the texture file at `public/paper-texture.jpg`. If it's missing
 * the page falls back to plain paper white — no error.
 */

type Stroke = {
  svg: ReactNode;
  /** Position as CSS values (vw / px / %). */
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  rotate: number;
  delay: number;
};

const STROKES: Stroke[] = [
  // Top-left long squiggle
  {
    svg: (
      <svg width="200" height="40" viewBox="0 0 200 40" fill="none">
        <path
          d="M5 20 Q 30 5, 55 20 T 105 20 T 155 20 T 195 18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    left: '5%',
    top: '10%',
    rotate: -6,
    delay: 0.2,
  },
  // Top-right small curve
  {
    svg: (
      <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
        <path
          d="M10 50 Q 45 5, 80 50"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    right: '8%',
    top: '14%',
    rotate: 12,
    delay: 0.5,
  },
  // Right-mid diagonal slash
  {
    svg: (
      <svg width="110" height="20" viewBox="0 0 110 20" fill="none">
        <path
          d="M5 14 L 105 6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    right: '4%',
    top: '50%',
    rotate: -18,
    delay: 0.9,
  },
  // Mid-left dot cluster
  {
    svg: (
      <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
        <circle cx="8" cy="10" r="2" fill="currentColor" />
        <circle cx="28" cy="9" r="1.6" fill="currentColor" />
        <circle cx="50" cy="11" r="2.2" fill="currentColor" />
        <circle cx="72" cy="10" r="1.4" fill="currentColor" />
      </svg>
    ),
    left: '3%',
    top: '48%',
    rotate: 5,
    delay: 0.7,
  },
  // Bottom-left short squiggle
  {
    svg: (
      <svg width="140" height="36" viewBox="0 0 140 36" fill="none">
        <path
          d="M5 22 Q 25 5, 50 22 T 95 22 T 135 18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    left: '6%',
    bottom: '12%',
    rotate: 8,
    delay: 1.1,
  },
  // Bottom-right cross / plus mark
  {
    svg: (
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <line x1="17" y1="4" x2="17" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="17" x2="30" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="7" x2="27" y2="27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="27" y1="7" x2="7" y2="27" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    right: '7%',
    bottom: '14%',
    rotate: 0,
    delay: 0.4,
  },
  // Top-center small dot trio
  {
    svg: (
      <svg width="60" height="14" viewBox="0 0 60 14" fill="none">
        <circle cx="8" cy="7" r="1.8" fill="currentColor" />
        <circle cx="30" cy="7" r="1.5" fill="currentColor" />
        <circle cx="52" cy="7" r="1.8" fill="currentColor" />
      </svg>
    ),
    left: '48%',
    top: '6%',
    rotate: 0,
    delay: 1.3,
  },
  // Bottom-center horizontal sweep
  {
    svg: (
      <svg width="120" height="16" viewBox="0 0 120 16" fill="none">
        <path
          d="M5 10 Q 30 4, 60 10 T 115 8"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
    left: '46%',
    bottom: '6%',
    rotate: 0,
    delay: 0.6,
  },
];

export default function PaperBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {/* Tiled paper texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/paper-texture.jpg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '720px',
        }}
      />
      {/* Subtle inner-vignette so edges feel a touch shadowed (depth) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(53,53,53,0.06) 100%)',
        }}
      />
      {/* Ink stroke decorations — hand-sketch feel, fixed positions, fade-in */}
      <div className="absolute inset-0 text-ink/55">
        {STROKES.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.6,
              delay: s.delay,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            style={{
              position: 'absolute',
              left: s.left,
              right: s.right,
              top: s.top,
              bottom: s.bottom,
              transform: `rotate(${s.rotate}deg)`,
              transformOrigin: 'center',
            }}
          >
            {s.svg}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
