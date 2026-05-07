import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { urlFor } from '@/sanity/imageUrl';
import type { SanityImage } from '@/sanity/types';

const ROTATE_MS = 7000;
const FADE_S = 1.4;

type Props = {
  /** Images uploaded under "Home Media → Hero carousel images" in
   *  Sanity. Cycle behind the headline; max 8. */
  images?: SanityImage[];
  className?: string;
};

/**
 * Cinematic backdrop for the hero. Cross-fades through the supplied
 * images every ~7 seconds with a 1.4s easing. A soft top-to-bottom
 * scrim keeps any layered text legible. Renders nothing when no
 * images are configured — the page stays clean while dad fills the
 * `homeMedia.heroImages` array in the studio.
 *
 * Pauses rotation when the tab is hidden (saves bandwidth / avoids the
 * "fast-forward" effect when you tab back in after a while).
 */
export default function HeroCarousel({
  images = [],
  className = '',
}: Props) {
  const [index, setIndex] = useState(0);

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
  // Each carousel slide needs a stable key. Sanity image objects come
  // with `_key` for array members; fall back to the asset reference if
  // _key is missing (defensive — shouldn't happen in practice).
  const key = current._key ?? current.asset?._ref ?? `hero-${index}`;

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={key}
          src={urlFor(current).width(2400).auto('format').url()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: FADE_S, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </AnimatePresence>
      {/* Scrim — barely-there at the top, transparent through the
          middle so the painting reads at full strength behind the
          headline, then tightening at the bottom to keep the "View
          Works / About the artist" links legible. */}
      <div className="absolute inset-0 bg-gradient-to-b from-paper/20 via-paper/5 to-paper/55" />
    </div>
  );
}
