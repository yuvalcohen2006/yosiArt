import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cardUrls, urlFor } from '@/sanity/imageUrl';
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
 * ±SPREAD with the centre card on top. Tightened for the compact hero — the
 * neighbours read as a quiet presence behind the active canvas rather than a
 * wide fan competing with it.
 */
const SPREAD = 33;

/**
 * Hero artwork carousel — a 3D "coverflow" over the Sanity
 * `homeMedia.heroImages` set, hanging in the beam of the hero's spotlight. The
 * active painting sits face-on in the centre; its neighbours peek from behind
 * on both sides, scaled down, angled away and softly blurred, like canvases
 * leaning against the studio wall. Advances every 4s, wrapping.
 *
 * Auto-advance pauses for OS reduced-motion users and for the accessibility
 * widget's "stop animations" mode (both reactive). Since the chevrons were
 * removed for the cleaner look, the segmented bar underneath doubles as the
 * only control: each segment is a real button, so every artwork stays
 * reachable by click and keyboard even when nothing is auto-advancing.
 *
 * It renders on the dark half of the hero, so its furniture is light-on-dark.
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

  // Separate, TINY renditions for the ambilight glow behind each card.
  // The glow used the same 800x1000 image as the card and leaned on a 40px CSS
  // blur, which meant the browser rasterising a heavy blur for every slide in
  // the set — the single most expensive thing on the landing page. Sanity
  // blurs a 64px-wide copy server-side instead; upscaled and lightly softened
  // it is visually identical (it is an out-of-focus halo either way) for
  // roughly 1/150th of the pixels.
  const glowUrls = useMemo(
    () =>
      images.map((img) =>
        urlFor(img).width(64).height(80).fit('crop').blur(20).auto('format').url(),
      ),
    [images],
  );

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
              // Named properties, not `transition-all`: `all` also animates
              // `filter`, so every 4s rotation was cross-fading a blur on each
              // card — expensive, and invisible next to the transform anyway.
              // The blur now switches instantly while the motion stays smooth.
              className="pointer-events-none absolute inset-0 transition-[transform,opacity] duration-500 ease-gallery motion-reduce:transition-none"
              style={{
                transform: `translateX(${pos * SPREAD}%) scale(${
                  isCenter ? 1 : isAdjacent ? 0.85 : 0.7
                }) rotateY(${pos * -10}deg)`,
                zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                opacity: isCenter ? 1 : isAdjacent ? 0.3 : 0,
                filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                visibility: Math.abs(pos) > 1 ? 'hidden' : 'visible',
              }}
            >
              {/* Ambilight — a blurred, brightened echo of the painting
                  itself bleeding into the dark stage, so each canvas appears
                  to cast its own light. Rides the card's opacity/transitions;
                  brightness lifts dark paintings that would otherwise glow
                  too weakly. */}
              <img
                aria-hidden
                src={glowUrls[i]}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-110 select-none rounded-md object-cover opacity-40 blur-lg brightness-125 saturate-150"
              />
              <img
                src={urls[i]}
                alt={isCenter ? pickAlt(image, locale) : ''}
                draggable={false}
                className={cn(
                  // A physical frame, not a UI border: dark-taupe moulding, a
                  // hairline of cream gilt, then the drop onto the wall — the
                  // difference between "card" and "canvas hung in a room".
                  'h-full w-full select-none rounded-md object-cover',
                  isCenter
                    ? 'shadow-[0_0_0_5px_#403d39,0_0_0_6px_rgba(255,252,242,0.12),0_24px_50px_-16px_rgba(0,0,0,0.85)]'
                    : 'shadow-[0_0_0_5px_rgba(64,61,57,0.7),0_12px_30px_-14px_rgba(0,0,0,0.7)]',
                )}
              />
            </div>
          );
        })}

      </div>

      {/* Floor shadow — the contact pool that grounds the floating coverflow
          on the stage instead of letting it hover in a void. */}
      <div
        aria-hidden
        className="mx-auto mt-4 h-5 w-4/5 bg-[radial-gradient(ellipse_50%_100%_at_50%_50%,rgba(0,0,0,0.5),transparent_70%)] blur-sm"
      />

      {/* Thin segmented bar — one segment per image, and the carousel's only
          control now that the chevrons are gone. While auto-playing the active
          segment fills over the 4s window; when auto-play is paused (reduced
          motion / stop animations) it shows a static position indicator rather
          than a fake countdown, and these buttons are then the ONLY way to
          reach the other artworks. Each hit area is padded well beyond the 3px
          hairline so it stays clickable. */}
      <div className="mt-3 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${t('heroCarousel.goTo')} ${i + 1}`}
            aria-current={i === index}
            className="group relative flex-1 py-2"
          >
            <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-flame-50/25 transition-colors duration-300 group-hover:bg-flame-50/40">
              {i < index && (
                <span className="block h-full w-full bg-flame-50/80" />
              )}
              {i === index &&
                (autoPlaying ? (
                  <span
                    key={index}
                    className="block h-full bg-flame-50/80"
                    style={{
                      animation: `heroCarouselFill ${DURATION_MS}ms linear forwards`,
                    }}
                  />
                ) : (
                  <span className="block h-full w-full bg-flame-50/80" />
                ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
