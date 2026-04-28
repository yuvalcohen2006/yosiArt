import { useEffect, useRef } from 'react';

/**
 * Subtle background motion — large soft gradient blobs drifting slowly
 * with sinusoidal motion. Reads as gentle depth, never as "particles".
 *
 *  - Pure canvas, no library; ~5 blobs on desktop, 3 on mobile.
 *  - Tinted in teal + deep at very low alpha (~4–7%) so the page still feels white.
 *  - Pauses when the tab is hidden; bails out entirely under prefers-reduced-motion.
 *  - Position fixed, behind all content via -z-10 so headings always stay legible.
 */

type GradientBlob = {
  cx: number;     // 0..1 base position
  cy: number;
  r: number;      // px radius
  colorIdx: number;
  alpha: number;
  phaseX: number;
  phaseY: number;
  ampX: number;   // 0..1 amplitude (fraction of viewport)
  ampY: number;
  freqX: number;  // radians per ms
  freqY: number;
};

const PALETTE = [
  { r: 60, g: 110, b: 113 }, // teal  #3c6e71
  { r: 40, g: 75, b: 99 },   // deep  #284b63
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (reduceMotion.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let blobs: GradientBlob[] = [];
    let rafId = 0;
    let running = true;
    const startTime = performance.now();

    const makeBlobs = (): GradientBlob[] => {
      const count = window.innerWidth < 768 ? 3 : 5;
      return Array.from({ length: count }, (_, i) => ({
        cx: rand(0.1, 0.9),
        cy: rand(0.1, 0.9),
        r: rand(280, 480),
        colorIdx: i % PALETTE.length,
        alpha: rand(0.04, 0.07),
        phaseX: rand(0, Math.PI * 2),
        phaseY: rand(0, Math.PI * 2),
        ampX: rand(0.06, 0.14),
        ampY: rand(0.05, 0.12),
        freqX: rand(0.00008, 0.00018),
        freqY: rand(0.00008, 0.00018),
      }));
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      width = w;
      height = h;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (blobs.length === 0) blobs = makeBlobs();
    };

    const step = () => {
      if (!running) return;
      const t = performance.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      for (const b of blobs) {
        const x =
          (b.cx + Math.sin(b.phaseX + t * b.freqX) * b.ampX) * width;
        const y =
          (b.cy + Math.cos(b.phaseY + t * b.freqY) * b.ampY) * height;
        const c = PALETTE[b.colorIdx];

        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${b.alpha})`);
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(step);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    rafId = requestAnimationFrame(step);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
