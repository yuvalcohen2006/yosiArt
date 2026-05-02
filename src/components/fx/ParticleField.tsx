import { useEffect, useRef } from 'react';

/**
 * Background motion — three layers, all very quiet:
 *
 *  1. Breathing gradient blobs (5 desktop / 3 mobile). Each blob has its
 *     own slow sinusoidal drift in x and y, plus a "breathing" pulse on
 *     radius (~±12% over ~22s) so the page subtly inhales and exhales.
 *
 *  2. Drifting strokes (14 desktop / 8 mobile). Thin teal/deep lines —
 *     half straight, half subtly curved (quadratic bezier with a small
 *     bow) — with gradient-faded ends. Wraps when off screen.
 *
 *  3. Pulsing dots (14 desktop / 7 mobile). Small filled circles with
 *     individual sine-wave alpha pulses and a slow linear drift.
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
  /** -1..1 — bow size for the bezier control point. 0 = straight line. */
  curvature: number;
  vx: number;
  vy: number;
  alpha: number;
  width: number;
  colorIdx: number;
};

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseFreq: number;
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
    let dots: Dot[] = [];
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
        alpha: rand(0.10, 0.16),
        phaseX: rand(0, Math.PI * 2),
        phaseY: rand(0, Math.PI * 2),
        ampX: rand(0.08, 0.16),
        ampY: rand(0.06, 0.14),
        freqX: rand(0.00010, 0.00022),
        freqY: rand(0.00010, 0.00022),
        breathPhase: rand(0, Math.PI * 2),
        breathFreq: rand(0.00025, 0.00045),
      }));
    };

    const makeStroke = (): Stroke => ({
      x: rand(0, width),
      y: rand(0, height),
      length: rand(120, 240),
      angle: (Math.random() - 0.5) * (Math.PI / 2.5),
      // ~50% straight, ~50% curved — keeps the layer mixed and abstract.
      curvature: Math.random() < 0.5 ? 0 : rand(-0.45, 0.45),
      vx: rand(-0.12, 0.12),
      vy: rand(-0.05, 0.05),
      alpha: rand(0.14, 0.26),
      width: rand(0.7, 1.1),
      colorIdx: Math.floor(Math.random() * PALETTE.length),
    });

    const makeStrokes = (): Stroke[] => {
      const count = isMobile() ? 8 : 14;
      return Array.from({ length: count }, makeStroke);
    };

    const makeDot = (): Dot => ({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.05, 0.05),
      vy: rand(-0.04, 0.04),
      r: rand(1.0, 2.4),
      baseAlpha: rand(0.18, 0.32),
      pulsePhase: rand(0, Math.PI * 2),
      pulseFreq: rand(0.0008, 0.0016),
      colorIdx: Math.floor(Math.random() * PALETTE.length),
    });

    const makeDots = (): Dot[] => {
      const count = isMobile() ? 7 : 14;
      return Array.from({ length: count }, makeDot);
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
      if (dots.length === 0) dots = makeDots();
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
      const margin = 280;
      for (const s of strokes) {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -margin) s.x = width + margin;
        if (s.x > width + margin) s.x = -margin;
        if (s.y < -margin) s.y = height + margin;
        if (s.y > height + margin) s.y = -margin;

        const dx = Math.cos(s.angle) * s.length;
        const dy = Math.sin(s.angle) * s.length;
        const ex = s.x + dx;
        const ey = s.y + dy;
        const c = PALETTE[s.colorIdx];

        const grad = ctx.createLinearGradient(s.x, s.y, ex, ey);
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0)`);
        grad.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},${s.alpha})`);
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        if (s.curvature === 0) {
          ctx.lineTo(ex, ey);
        } else {
          // Control point: midpoint of the segment, offset perpendicularly
          // by `curvature * length` to bow the curve.
          const px = -dy * s.curvature;
          const py = dx * s.curvature;
          const cx = s.x + dx / 2 + px;
          const cy = s.y + dy / 2 + py;
          ctx.quadraticCurveTo(cx, cy, ex, ey);
        }
        ctx.stroke();
      }
    };

    const drawDots = (t: number) => {
      const margin = 20;
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -margin) d.x = width + margin;
        if (d.x > width + margin) d.x = -margin;
        if (d.y < -margin) d.y = height + margin;
        if (d.y > height + margin) d.y = -margin;

        const pulse = 0.55 + Math.sin(d.pulsePhase + t * d.pulseFreq) * 0.45;
        const a = d.baseAlpha * pulse;
        const c = PALETTE[d.colorIdx];

        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      if (!running) return;
      const t = performance.now() - startTime;
      ctx.clearRect(0, 0, width, height);
      drawBlobs(t);
      drawStrokes();
      drawDots(t);
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
