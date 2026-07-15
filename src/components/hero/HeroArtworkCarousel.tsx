import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cardUrls } from '@/sanity/imageUrl';
import type { SanityImage } from '@/sanity/types';
import { useLocale } from '@/hooks/useLocale';
import { useStopMotion } from '@/components/a11y/useStopMotion';
import { pickAlt } from '@/lib/pickAlt';
import { mod } from '@/lib/mod';
import { cn } from '@/lib/utils';

/** Each image is shown for exactly this long before advancing. */
const DURATION_MS = 4000;

/**
 * Spread of the coverflow, as a % of the card width. Side cards sit at
 * ±SPREAD with the centre card on top. Kept modest so the fanned cards stay
 * inside the painted frame's white field on both LTR and RTL layouts.
 */
const SPREAD = 42;

/**
 * Hero artwork carousel — a 3D "coverflow" over the Sanity
 * `homeMedia.heroImages` set. The active painting sits face-on in the centre;
 * its neighbours peek from behind on both sides, scaled down, angled away and
 * softly blurred, like canvases leaning against the studio wall. Advances
 * every 4s (wrapping), and can be driven manually with the chevron buttons.
 *
 * Auto-advance pauses for OS reduced-motion users and for the accessibility
 * widget's "stop animations" mode (both reactive); the chevrons keep every
 * artwork reachable either way.
 *
 * Below the stage sits the thin segmented progress bar — one segment per
 * image — whose active segment fills over the 4s display window.
 */
export default function HeroArtworkCarousel({
  images,
}: {
  images: SanityImage[];
}) {
  const { locale, t } = useLocale();
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const stopMotion = useStopMotion();
  const count = images.length;
  const autoPlaying = count > 1 && !reducedMotion && !stopMotion;

  // One URL per slide, built once — the same string is used for preloading
  // and rendering, so the render hits the cache instead of a fresh request.
  const urls = useMemo(() => cardUrls(images, 800, 1000), [images]);

  // Preload EVERY slide in parallel on mount (client only — effects don't run
  // during SSG), so each rotation blends fully-loaded images.
  useEffect(() => {
    urls.forEach((u) => {
      const im = new Image();
      im.src = u;
    });
  }, [urls]);

  // Auto-advance: one 4s timer per shown slide. Re-armed whenever `index`
  // changes, so a manual chevron press restarts the full window; pausing
  // (reduced motion / stop-animations) simply stops re-arming.
  useEffect(() => {
    if (!autoPlaying) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % count),
      DURATION_MS,
    );
    return () => window.clearTimeout(id);
  }, [autoPlaying, count, index]);

  if (count === 0) return null;

  return (
    <div className="w-full">
      {/* Stage — the centre card defines the footprint; neighbours overflow
          it on purpose, fanned into the photo's white field. The cards are
          purely visual, so the whole stack ignores the pointer — only the
          chevrons (and the headline layered above) are interactive. */}
      <div className="relative aspect-[4/5] w-full [perspective:1000px]">
        {images.map((image, i) => {
          // Wrapped offset: shortest signed distance from the active card,
          // so the loop is seamless in both directions.
          let pos = mod(i - index, count);
          if (pos > Math.floor(count / 2)) pos -= count;

          const isCenter = pos === 0;
          const isAdjacent = Math.abs(pos) === 1;

          return (
            <div
              key={image._key ?? i}
              aria-hidden={!isCenter}
              className="pointer-events-none absolute inset-0 transition-all duration-500 ease-gallery motion-reduce:transition-none"
              style={{
                transform: `translateX(${pos * SPREAD}%) scale(${
                  isCenter ? 1 : isAdjacent ? 0.85 : 0.7
                }) rotateY(${pos * -10}deg)`,
                zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                opacity: isCenter ? 1 : isAdjacent ? 0.45 : 0,
                filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                visibility: Math.abs(pos) > 1 ? 'hidden' : 'visible',
              }}
            >
              <img
                src={urls[i]}
                alt={isCenter ? pickAlt(image, locale) : ''}
                draggable={false}
                className={cn(
                  'h-full w-full select-none rounded-md border border-ink/10 object-cover',
                  isCenter
                    ? 'shadow-[0_24px_48px_-24px_rgba(37,36,34,0.45)]'
                    : 'shadow-lg',
                )}
              />
            </div>
          );
        })}

        {/* Chevron navigation — physical left/right to match the physical
            card motion, so it reads the same in Hebrew and English. */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => mod(i - 1, count))}
              aria-label={t('heroCarousel.prev')}
              className="absolute -left-3 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-paper/70 text-ink backdrop-blur-sm transition-colors duration-300 hover:border-primary/60 hover:text-primary md:h-9 md:w-9"
            >
              <ChevronLeft aria-hidden className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => mod(i + 1, count))}
              aria-label={t('heroCarousel.next')}
              className="absolute -right-3 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-paper/70 text-ink backdrop-blur-sm transition-colors duration-300 hover:border-primary/60 hover:text-primary md:h-9 md:w-9"
            >
              <ChevronRight aria-hidden className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thin segmented progress bar — one segment per image. While
          auto-playing the active segment fills over the 4s window; when
          auto-play is paused (reduced motion / stop animations) it shows as
          a static position indicator instead of a fake countdown. */}
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {images.map((_, i) => (
          <div
            key={i}
            className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10"
          >
            {i < index && <div className="h-full w-full bg-ink/60" />}
            {i === index &&
              (autoPlaying ? (
                <div
                  key={index}
                  className="h-full bg-ink/60"
                  style={{
                    animation: `heroCarouselFill ${DURATION_MS}ms linear forwards`,
                  }}
                />
              ) : (
                <div className="h-full w-full bg-ink/60" />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
