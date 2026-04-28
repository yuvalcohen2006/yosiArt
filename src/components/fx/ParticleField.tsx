import { useEffect, useRef } from 'react';

/**
 * Background motion — two layers, both very quiet:
 *
 *  1. Breathing gradient blobs (5 desktop / 3 mobile). Each blob has its
 *     own slow sinusoidal drift in x and y, plus a "breathing" pulse on
 *     radius (~±12% over ~22s) so the page subtly inhales and exhales.
 *
 *  2. Floating strokes (10 desktop / 6 mobile). Thin teal/deep lines with
 *     gradient-faded ends, drifting linearly across the viewport. Wraps
 *     when off screen.
 *
 * Pure canvas, no library. Pauses when the tab is hidden; bails out
 * entirely under prefers-reduced-motion. Position fixed behind all content
 * via -z-10 so headings always stay legible.
 */

type GradientBlob = {
  cx: number;
  cy: number;
  r: number;
  colorIdx: number;
  alpha: number;
  phaseX: number;
  phaseY: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  breathPhase: number;
  breathFreq: number;
};

type Stroke = {
  x: number;
  y: number;
  length: number;
  angle: number;
  vx: number;
  vy: number;
  alpha: number;
  width: number;
  colorIdx: number;
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
    let strokes: Stroke[] = [];
    let rafId = 0;
    let running = true;
    const startTime = performance.now();

    const isMobile = () => window.innerWidth < 768;

    const makeBlobs = (): GradientBlob[] => {
      const count = isMobile() ? 3 : 5;
      return Array.from({ length: count }, (_, i) => ({
        cx: rand(0.1, 0.9),
        cy: rand(0.1, 0.9),
        r: rand(280, 480),
        colorIdx: i % PALETTE.length,
        alpha: rand(0.08, 0.14),
        phaseX: rand(0, Math.PI * 2),
        phaseY: rand(0, Math.PI * 2),
        ampX: rand(0.08, 0.16),
        ampY: rand(0.06, 0.14),
        freqX: rand(0.00010, 0.00022),
        freqY: rand(0.00010, 0.00022),
        breathPhase: rand(0, Math.PI * 2),
        breathFreq: rand(0.00025, 0.00045), // ~14–25s breath cycle
      }));
    };

    const makeStroke = (): Stroke => ({
      x: rand(0, width),
      y: rand(0, height),
      length: rand(110, 220),
      // Mostly horizontal with a slight tilt — feels organic, not striped.
      angle: (Math.random() - 0.5) * (Math.PI / 2.5),
      vx: rand(-0.12, 0.12),
      vy: rand(-0.05, 0.05),
      alpha: rand(0.12, 0.22),
      width: rand(0.7, 1.1),
      colorIdx: Math.floor(Math.random() * PALETTE.length),
    });

    const makeStrokes = (): Stroke[] => {
      const count = isMobile() ? 6 : 10;
      return Array.from({ length: count }, makeStroke);
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
      if (strokes.length === 0) strokes = makeStrokes();
    };

    const drawBlobs = (t: number) => {
      for (const b of blobs) {
        const x =
          (b.cx + Math.sin(b.phaseX + t * b.freqX) * b.ampX) * width;
        const y =
          (b.cy + Math.cos(b.phaseY + t * b.freqY) * b.ampY) * height;
        const breath = 1 + Math.sin(b.breathPhase + t * b.breathFreq) * 0.12;
        const r = b.r * breath;
        const c = PALETTE[b.colorIdx];

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${b.alpha})`);
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawStrokes = () => {
      const margin = 240;
      for (const s of strokes) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -margin) s.x = width + margin;
        if (s.x > width + margin) s.x = -margin;
        if (s.y < -margin) s.y = height + margin;
        if (s.y > height + margin) s.y = -margin;

        const dx = Math.cos(s.angle) * s.length;
        const dy = Math.sin(s.angle) * s.length;
        const c = PALETTE[s.colorIdx];

        const grad = ctx.createLinearGradient(s.x, s.y, s.x + dx, s.y + dy);
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0)`);
        grad.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},${s.alpha})`);
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + dx, s.y + dy);
        ctx.stroke();
      }
    };

    const step = () => {
      if (!running) return;
      const t = performance.now() - startTime;
      ctx.clearRect(0, 0, width, height);
      drawBlobs(t);
      drawStrokes();
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
