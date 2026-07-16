import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useStopMotion } from '@/components/a11y/useStopMotion';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Linear 0→1 ramp of `p` across [a, b], clamped at both ends. */
const ramp = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const lerp = (x: number, y: number, t: number) => x + (y - x) * t;

interface PainterWorldScrollProps {
  /** Looping video (autoplay/muted). Falls back to `posterSrc` if it can't load. */
  videoSrc: string;
  /** Still shown before/instead of the video. */
  posterSrc: string;
  line1: string;
  line2: string;
  /** Called (only on change) so the page can lift the navbar out during the
   *  video beats and ease it back in as the collections reveal. */
  onNavHiddenChange?: (hidden: boolean) => void;
}

/**
 * "Painter's World" — a pinned, scroll-driven expand between the hero and the
 * collections. Adapted from a Next.js scroll-hijack demo into a plain-React
 * section that reads the browser's own scroll (never fighting it).
 *
 * A tall section pins a white stage; one self-computed scroll progress (0→1)
 * drives every beat, written straight to the DOM on rAF (so all the values move
 * together — no drift):
 *   · enter  — a 4:5 video plays centred with "dive into the / painter's world";
 *   · expand — the frame grows 4:5 → 16:9 (kept off the edges) as the title fades;
 *   · reveal — the stage releases (un-pins) + dissolves, uncovering the
 *              collections rail below; the navbar eases back in.
 *
 * Reduced-motion / stop-animations users get a calm static presentation.
 */
export default function PainterWorldScroll({
  videoSrc,
  posterSrc,
  line1,
  line2,
  onNavHiddenChange,
}: PainterWorldScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lastHidden = useRef(false);

  const reduced = useReducedMotion();
  const stopMotion = useStopMotion();
  const still = (reduced ?? false) || stopMotion;

  useEffect(() => {
    if (still) return;
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = clamp(-section.getBoundingClientRect().top / total, 0, 1);

      const frame = frameRef.current;
      if (frame) {
        const e = ramp(p, 0.02, 0.46); // 4:5 → 16:9
        frame.style.width = `${lerp(30, 84, e)}vw`;
        frame.style.aspectRatio = `${lerp(0.8, 16 / 9, e)}`;
        frame.style.opacity = `${lerp(1, 0.35, ramp(p, 0.82, 1))}`; // dissolve on release
      }
      const title = titleRef.current;
      if (title) {
        title.style.opacity = `${lerp(1, 0, ramp(p, 0.04, 0.22))}`;
        title.style.transform = `scale(${lerp(1, 1.12, ramp(p, 0.04, 0.3))})`;
      }

      const hidden = p > 0.05 && p < 0.66;
      if (hidden !== lastHidden.current) {
        lastHidden.current = hidden;
        onNavHiddenChange?.(hidden);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [still, onNavHiddenChange]);

  if (still) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-10 bg-white px-6 py-24">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.18)]">
          <video
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            className="aspect-video w-full object-cover"
          />
        </div>
        <h2 className="text-center font-display text-4xl font-semibold leading-[1.05] text-ink md:text-6xl">
          {line1}
          <br />
          {line2}
        </h2>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[320vh] bg-white">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Media frame — starts 4:5; the scroll handler grows it to 16:9 then
            dissolves it as the stage releases. */}
        <div
          ref={frameRef}
          style={{ width: '30vw', aspectRatio: '0.8' }}
          className="relative max-h-[84vh] max-w-[92vw] overflow-hidden rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.22)] will-change-[width,opacity]"
        >
          <video
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          {/* faint darken so the white title stays legible over the footage */}
          <div className="pointer-events-none absolute inset-0 bg-black/25" />
        </div>

        {/* Title — centred over the media, fades out as the frame opens up. */}
        <h2
          ref={titleRef}
          aria-hidden
          className="pointer-events-none absolute z-10 px-6 text-center font-display text-5xl font-semibold leading-[1.05] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] will-change-[opacity,transform] md:text-6xl lg:text-7xl"
        >
          {line1}
          <br />
          {line2}
        </h2>
      </div>
    </section>
  );
}
