import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/*
  Adapted from the reference implementation. Four things had to change:

  1. It imported from `motion/react`; this project already ships
     `framer-motion`, so there was no new dependency to add — and in the end
     no animation library is used here at all (see 4).
  2. Its beams were `w-screen h-screen` with `z-40`. Viewport sizing breaks the
     footer, which is far shorter than a screen; z-40 is the site's navbar
     layer, so decoration could paint over real content. Everything is sized to
     its CONTAINER and sits at z-0 now.
  3. The gradients were blue (hsl 210). They are pure neutral white here, very
     low alpha, so they read as clean light on the near-black stage.
  4. The drift was a JS animation (`repeat: Infinity`), which runs on the MAIN
     THREAD every single frame for as long as the section is mounted — it
     competes directly with scrolling and was a real source of stutter. It is
     a plain CSS animation now: transform-only, so the compositor owns it and
     the main thread does nothing at all. That also means the accessibility
     kill-switch and the reduced-motion rule in index.css stop it for free,
     with no JS gating.
*/

/*
  Pure white and deliberately barely there — every stop is neutral (no hue),
  with alphas low enough to suggest a light source without lifting the black.
*/
const GRADIENT_FIRST =
  'radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 100%, .04) 0, hsla(0, 0%, 100%, .012) 50%, hsla(0, 0%, 100%, 0) 80%)';
const GRADIENT_SECOND =
  'radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .032) 0, hsla(0, 0%, 100%, .01) 80%, transparent 100%)';
const GRADIENT_THIRD =
  'radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .024) 0, hsla(0, 0%, 100%, .008) 80%, transparent 100%)';

type SpotlightProps = {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
};

/**
 * Two soft beams raking in from the top corners, drifting slowly in and out.
 * Purely decorative: `pointer-events-none`, z-0, and the layout never depends
 * on it.
 */
export function Spotlight({
  gradientFirst = GRADIENT_FIRST,
  gradientSecond = GRADIENT_SECOND,
  gradientThird = GRADIENT_THIRD,
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}: SpotlightProps = {}) {
  return (
    <div
      aria-hidden
      className="spot-fade pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    >
      {/* Beam from the top-left. The drift distance and pace are handed to CSS
          as custom properties so the animation itself stays a static rule. */}
      <div
        className="spot-drift pointer-events-none absolute left-0 top-0 h-full w-full"
        style={
          {
            '--spot-x': `${xOffset}px`,
            '--spot-duration': `${duration}s`,
          } as React.CSSProperties
        }
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="absolute left-0 top-0"
        />
        <div
          style={{
            transform: 'rotate(-45deg) translate(5%, -50%)',
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute left-0 top-0 origin-top-left"
        />
        <div
          style={{
            transform: 'rotate(-45deg) translate(-180%, -70%)',
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute left-0 top-0 origin-top-left"
        />
      </div>

      {/* Beam from the top-right — same drift, mirrored. */}
      <div
        className="spot-drift pointer-events-none absolute right-0 top-0 h-full w-full"
        style={
          {
            '--spot-x': `${-xOffset}px`,
            '--spot-duration': `${duration}s`,
          } as React.CSSProperties
        }
      >
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className="absolute right-0 top-0"
        />
        <div
          style={{
            transform: 'rotate(45deg) translate(-5%, -50%)',
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute right-0 top-0 origin-top-right"
        />
        <div
          style={{
            transform: 'rotate(45deg) translate(180%, -70%)',
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className="absolute right-0 top-0 origin-top-right"
        />
      </div>
    </div>
  );
}

/**
 * Corner vignette — pulls the four corners down into black so the stage reads
 * as lit from the middle rather than as a flat rectangle, and gives the beams
 * somewhere to fall off into.
 */
export function Vignette({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 z-0', className)}
      style={{
        background:
          'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.72) 100%)',
      }}
    />
  );
}

/** The grid tile, as an inline SVG — weightless, crisp at any resolution. */
const GRID_TILE = (opacity: string) =>
  `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / ${opacity})'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`;

/** Diameter of the cursor's pool of light, in px. */
const TORCH = 460;

/**
 * The fine graph-paper grid the beams fall across.
 *
 * With `interactive`, a second copy of the grid — brighter, and masked to a
 * soft circle — follows the cursor, so the lines quietly light up under it.
 * That copy is a small fixed-size element moved with `transform`, never by
 * changing its position or its gradient: transforms are compositor work, so
 * tracking the cursor costs no layout and no repaint. Updates are also
 * rAF-throttled, so a fast mouse can't outpace the frame rate.
 *
 * Skipped entirely on touch/coarse pointers (there is no cursor to follow)
 * and under reduced motion.
 */
export function GridBackground({
  className,
  interactive = false,
  torchOpacity = '0.16',
}: {
  className?: string;
  interactive?: boolean;
  /** Brightness of the cursor's pool of light (the grid lines under it).
   *  Lower it for a subtler highlight — e.g. the footer. */
  torchOpacity?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const torchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;
    const host = hostRef.current;
    const torch = torchRef.current;
    if (!host || !torch) return;
    // A cursor effect needs a cursor; and it is motion, so honour the setting.
    if (
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      const px = x - TORCH / 2;
      const py = y - TORCH / 2;
      torch.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      // Counter-shift the tile by exactly what the element moved, so the
      // bright grid stays locked to the page instead of travelling with the
      // cursor. Without this the patch carries its own grid along and reads as
      // a square stuck to the pointer rather than light falling on the wall.
      torch.style.backgroundPosition = `${-px}px ${-py}px`;
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      // Only react while the pointer is actually over this section.
      const inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      torch.style.opacity = inside ? '1' : '0';
      if (!inside) return;
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [interactive]);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-0 overflow-hidden',
        className,
      )}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: GRID_TILE('0.04') }}
      />
      {interactive && (
        <div
          ref={torchRef}
          className="absolute left-0 top-0 opacity-0 transition-opacity duration-500 will-change-transform"
          style={{
            width: TORCH,
            height: TORCH,
            backgroundImage: GRID_TILE(torchOpacity),
            // Fades to nothing at the rim, so it reads as a pool of light on
            // the grid rather than a square patch of brighter grid.
            maskImage:
              'radial-gradient(circle at center, black 0%, rgba(0,0,0,0.55) 45%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(circle at center, black 0%, rgba(0,0,0,0.55) 45%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
