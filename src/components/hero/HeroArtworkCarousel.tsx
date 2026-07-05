import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { urlFor } from '@/sanity/imageUrl';
import type { SanityImage } from '@/sanity/types';
import { useLocale } from '@/hooks/useLocale';

/** Each image is shown for exactly this long before advancing. */
const DURATION_MS = 4000;

/**
 * Hero artwork carousel — cycles the Sanity `homeMedia.heroImages` set (the
 * "Hero carousel" photo set): one image every 4s with a soft cross-fade,
 * looping back to the first after the last.
 *
 * Below the image sits a thin, subtle segmented bar — one segment per image —
 * whose active segment fills, empty → full, over the same 4s, resetting when
 * the next image takes over.
 */
export default function HeroArtworkCarousel({
  images,
}: {
  images: SanityImage[];
}) {
  const { locale } = useLocale();
  const [index, setIndex] = useState(0);
  const count = images.length;
  const tiltRef = useRef<HTMLDivElement>(null);

  // Holographic-card style tilt (animation only, no glow): the card leans
  // toward the cursor — rotation grows with distance from the centre — and
  // eases back flat on leave. Mouse-only by nature; skipped for
  // prefers-reduced-motion.
  const handleTiltMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const card = tiltRef.current;
    if (!card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = (y - rect.height / 2) / 10;
    const rotateY = (rect.width / 2 - x) / 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };
  const handleTiltLeave = () => {
    const card = tiltRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  // One URL per slide, built once — the same string is used for preloading
  // and rendering, so the render hits the cache instead of a fresh request.
  const urls = useMemo(
    () =>
      images.map((img) =>
        urlFor(img).width(800).height(1000).fit('crop').auto('format').url(),
      ),
    [images],
  );

  // Preload EVERY slide in parallel on mount (client only — effects don't run
  // during SSG). By the time the first 4s rotation fires, all images sit in
  // the browser cache, so each cross-fade blends two fully-loaded images
  // instead of fetching mid-fade.
  useEffect(() => {
    urls.forEach((u) => {
      const im = new Image();
      im.src = u;
    });
  }, [urls]);

  useEffect(() => {
    if (count <= 1) return;
    setIndex(0);
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      DURATION_MS,
    );
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const current = images[Math.min(index, count - 1)];
  const src = urls[Math.min(index, count - 1)];
  const alt =
    (locale === 'he' ? current.altHe : current.alt) ?? current.alt ?? '';

  return (
    <div className="w-full">
      <div
        ref={tiltRef}
        onMouseMove={handleTiltMove}
        onMouseLeave={handleTiltLeave}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-ink/5 transition-transform duration-200 ease-out will-change-transform"
      >
        <AnimatePresence>
          <motion.img
            key={index}
            src={src}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* Thin segmented progress bar — one segment per image. */}
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {images.map((_, i) => (
          <div
            key={i}
            className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10"
          >
            {i < index && <div className="h-full w-full bg-ink/60" />}
            {i === index && (
              <div
                key={index}
                className="h-full bg-ink/60"
                style={{
                  animation: `heroCarouselFill ${DURATION_MS}ms linear forwards`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
