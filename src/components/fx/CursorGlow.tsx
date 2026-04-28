import { useEffect, useRef, useState } from 'react';

/**
 * Soft teal glow that follows the cursor with a tiny lerp delay so it
 * feels weighted, not glued to the pointer. Uses `mix-blend-mode: multiply`
 * so it tints content beneath without ever obscuring text.
 *
 * Hidden on touch devices (no hover capability) and under
 * prefers-reduced-motion. Updates via direct DOM transform — no React
 * re-render per mousemove.
 */
const SIZE = 220;
const HALF = SIZE / 2;

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Detect hover capability + reduced motion — only mount the effect when both pass.
  useEffect(() => {
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setActive(hover.matches && !reduce.matches);
    update();
    hover.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      hover.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let targetX = -HALF;
    let targetY = -HALF;
    let curX = -HALF;
    let curY = -HALF;
    let visible = false;

    const tick = () => {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      el.style.transform = `translate3d(${curX - HALF}px, ${curY - HALF}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = '1';
      }
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 opacity-0 transition-opacity duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        background:
          'radial-gradient(closest-side, rgba(60,110,113,0.18), rgba(60,110,113,0))',
        mixBlendMode: 'multiply',
      }}
    />
  );
}
