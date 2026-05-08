import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { urlFor } from '@/sanity/imageUrl';
import type { SanityImage } from '@/sanity/types';

const ROTATE_MS = 7000;
const FADE_S = 1.4;
/** Final on-screen opacity for the image. Low enough to read text on
 *  top without a darkening scrim, high enough to register as a real
 *  painting in the background. */
const IMAGE_OPACITY = 0.45;

type Props = {
  /** Images uploaded under "Home Media → Hero carousel images" in
   *  Sanity. Cycle behind the headline; max 8. */
  images?: SanityImage[];
  className?: string;
};

/** Build the displayed source URL for a hero image. Centralised so the
 *  preloader and the rendered <img> can't drift apart. */
const sourceFor = (image: SanityImage): string =>
  urlFor(image).width(2400).auto('format').url();

/**
 * Cinematic backdrop for the hero. Cross-fades through the supplied
 * images every ~7 seconds. Each image:
 *   - fades up from invisible on first mount (no snap)
 *   - sits at low opacity so the headline reads on top
 *   - is constrained to a centred rounded box with padding around it
 *   - has its four edges feathered via a radial mask, so it bleeds
 *     softly into the paper texture instead of stopping at a hard
 *     rectangular edge
 *
 * On mount we kick off a browser-level preload for every image so the
 * next slide is already in cache by the time the cross-fade reaches
 * it — no on-air loading flash.
 */
export default function HeroCarousel({
  images = [],
  className = '',
}: Props) {
  const [index, setIndex] = useState(0);

  // Preload every slide on mount. Browsers cache by URL; once these
  // promises settle, the same URLs in `<motion.img src=...>` resolve
  // instantly when the AnimatePresence swap fires.
  useEffect(() => {
    if (typeof window === 'undefined' || images.length === 0) return;
    images.forEach((image) => {
      const preload = new window.Image();
      preload.src = sourceFor(image);
    });
  }, [images]);

  useEffect(() => {
    if (images.length < 2) return;
    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (id !== null) return;
      id = setInterval(
        () => setIndex((i) => (i + 1) % images.length),
        ROTATE_MS,
      );
    };
    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [images.length]);

  if (images.length === 0) return null;

  const current = images[index];
  if (!current) return null;
  const key = current._key ?? current.asset?._ref ?? `hero-${index}`;

  // Radial soft-edge mask — fades the image to transparent toward all
  // four corners, so the rectangle dissolves into the paper texture
  // instead of stopping at a sharp edge.
  const softEdgeMask =
    'radial-gradient(ellipse 80% 80% at center, black 35%, transparent 92%)';

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      {/* Inner frame — centred, padded from the section edges, with
          rounded corners. The image sits inside this. On large screens
          the vertical padding shrinks so more of the painting is
          visible at top + bottom while the side gutters stay generous. */}
      <div
        className="absolute inset-6 sm:inset-10 md:inset-16 lg:inset-x-20 lg:inset-y-12 overflow-hidden rounded-3xl"
        style={{
          maskImage: softEdgeMask,
          WebkitMaskImage: softEdgeMask,
        }}
      >
        <AnimatePresence mode="sync">
          <motion.img
            key={key}
            src={sourceFor(current)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: IMAGE_OPACITY, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: FADE_S, ease: [0.22, 0.61, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
