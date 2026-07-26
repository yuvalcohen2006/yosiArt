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

  Nudged up a touch from their original values now that the grid has retreated
  to the edges: these beams and the StageWash below are the only things left in
  the middle of the frame, so they have to carry it on their own.
*/
const GRADIENT_FIRST =
  'radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 100%, .05) 0, hsla(0, 0%, 100%, .016) 50%, hsla(0, 0%, 100%, 0) 80%)';
const GRADIENT_SECOND =
  'radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .04) 0, hsla(0, 0%, 100%, .012) 80%, transparent 100%)';
const GRADIENT_THIRD =
  'radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .03) 0, hsla(0, 0%, 100%, .01) 80%, transparent 100%)';

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
 * The wash that gives the middle of the stage its depth: near-black at the
 * rim, lifting to a dark charcoal under the beams.
 *
 * This replaced a true vignette — a black overlay that darkened the four
 * corners inward. That was the right tool while the grid ran edge to edge and
 * the middle was the busiest part of the frame; it is exactly the wrong one
 * now that the grid has retreated TO the corners, because it spent its opacity
 * dimming the one thing the edges are meant to show.
 *
 * Inverting it does both jobs at once. Lifting the centre and falling away to
 * nothing still reads as a vignette — the rim is darker than the middle either
 * way — but the darkness at the rim is now simply the stage's own #0a0a0a
 * showing through, with nothing laid over the grid at all.
 *
 * White at a low alpha rather than a mixed grey, so it composites as light
 * falling on a black wall instead of grey paint applied to it. At its brightest
 * it lands the stage near #1c1c1c — charcoal, nowhere near lifting the black.
 *
 * Anchored HIGH and wide (`at 50% 6%`), not centred. A big soft ellipse in the
 * middle of the frame lifts everything at once, which reads as a grey haze
 * hanging over the stage rather than as light: there is no direction to it, and
 * no part of the frame is left properly black for the charcoal to be charcoal
 * against. Pouring it from the top edge instead gives the fall-off somewhere to
 * go — charcoal up where the beams enter, true black by the lower third — and
 * puts the gradient and the beams in agreement about where the light is coming
 * from.
 */
export function StageWash({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 z-0', className)}
      style={{
        background:
          'radial-gradient(ellipse 92% 58% at 50% 6%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.038) 32%, rgba(255,255,255,0.012) 60%, rgba(255,255,255,0) 82%)',
      }}
    />
  );
}

/** The grid tile, as an inline SVG — weightless, crisp at any resolution. */
const GRID_TILE = (opacity: string) =>
  `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / ${opacity})'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`;

/** Diameter of the cursor's pool of light, in px. Small on purpose — a
 *  penlight held to the wall, not a floodlight. */
const TORCH = 190;

/*
  ===== The edge mask =====
  The grid is not drawn across the whole stage; it lives at the rim and fades
  out well before the middle, so the centre of the frame is nothing but the
  StageWash and the beams.

  Radii are fractions of the host's own width/height, so the shape holds for
  both the full-height hero and the short, wide footer without either needing
  its own tuning. Everything below is expressed on ONE normalised scale where
  1.0 is the ellipse's edge, which is what lets the JS torch fade share these
  exact numbers instead of approximating them:

    d = 0            dead centre
    d = EDGE_IN      the grid begins to appear
    d = ~0.81/0.86   the left/right and top/bottom edges
    d = 1.0          full strength
    d = ~1.18        the corners (clamped at full)

  So the corners carry the most grid, the sides carry a good deal, and the
  middle carries none — which is the "vignette" the brief asks for, just made
  of grid instead of shadow.
*/
const EDGE_RX = 0.62;
const EDGE_RY = 0.58;
const EDGE_IN = 0.3;
const EDGE_OUT = 1;

const EDGE_MASK = `radial-gradient(ellipse ${EDGE_RX * 100}% ${EDGE_RY * 100}% at 50% 50%, transparent ${EDGE_IN * 100}%, rgba(0,0,0,0.30) 62%, rgba(0,0,0,0.72) 84%, #000 ${EDGE_OUT * 100}%)`;

/**
 * How much grid there is at a point, on the mask's own scale: 0 in the middle,
 * 1 at the rim. The torch is driven by this so it can only light grid that is
 * actually there — an undimmed torch in the centre would light up lines the
 * mask has hidden, and the middle would stop being empty the moment anyone
 * moved the mouse through it.
 */
function edgeStrength(px: number, py: number, w: number, h: number) {
  const dx = (px / w - 0.5) / EDGE_RX;
  const dy = (py / h - 0.5) / EDGE_RY;
  const d = Math.hypot(dx, dy);
  const t = Math.min(1, Math.max(0, (d - EDGE_IN) / (EDGE_OUT - EDGE_IN)));
  return t * t * (3 - 2 * t); // smoothstep — eases in rather than ramping flat
}

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
    let strength = 0;

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
      // Written here rather than straight from the pointer handler so that a
      // fast mouse still only touches style once per frame. Opacity and
      // transform are both compositor properties, so this stays off the main
      // thread's critical path.
      torch.style.opacity = String(strength);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      // Only react while the pointer is actually over this section.
      const inside =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      if (!inside) {
        if (strength === 0) return; // already dark; nothing to schedule
        strength = 0;
      } else {
        x = e.clientX - r.left;
        y = e.clientY - r.top;
        // The torch is only ever as bright as the grid beneath it.
        strength = edgeStrength(x, y, r.width, r.height);
      }
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
      {/* The resting grid. Masked to the rim — see EDGE_MASK — so the middle of
          the stage is left to the wash and the beams. The mask lives on THIS
          element rather than on the host, deliberately: a mask on the host
          would wrap the moving torch in a masked group and force it to be
          re-composited against that mask every frame, which is exactly the
          per-frame main-thread cost the torch is built to avoid. This element
          never moves, so masking it is free. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRID_TILE('0.05'),
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
      />
      {interactive && (
        <div
          ref={torchRef}
          // Short transition: opacity is now updated continuously as the cursor
          // moves nearer the rim, so it acts as a light smoothing filter. At
          // the old 500ms it would have lagged the pointer badly.
          className="absolute left-0 top-0 opacity-0 transition-opacity duration-200 will-change-transform"
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
