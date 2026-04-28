import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFeaturedPaintings } from '@/hooks/useFeaturedPaintings';
import { urlFor } from '@/sanity/imageUrl';

const ROTATE_MS = 7000;
const FADE_S = 1.4;

type Props = { className?: string };

/**
 * Cinematic backdrop for the hero. Cross-fades through featured paintings
 * every ~7 seconds with a 1.4s easing. A soft top-to-bottom scrim keeps
 * any layered text legible. Renders nothing when no featured paintings
 * exist yet — the page stays clean while dad fills the dataset.
 *
 * Pauses rotation when the tab is hidden (saves bandwidth / avoids the
 * "fast-forward" effect when you tab back in after a while).
 */
export default function HeroCarousel({ className = '' }: Props) {
  const state = useFeaturedPaintings();
  const [index, setIndex] = useState(0);

  const items = state.status === 'success' ? state.data : [];

  useEffect(() => {
    if (items.length < 2) return;
    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (id !== null) return;
      id = setInterval(
        () => setIndex((i) => (i + 1) % items.length),
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
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index];
  const image = current.images?.[0];
  if (!image) return null;

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={current._id}
          src={urlFor(image).width(2400).auto('format').url()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: FADE_S, ease: [0.22, 0.61, 0.36, 1] }}
        />
      </AnimatePresence>
      {/* Scrim: keeps headline legible without flattening the painting. */}
      <div className="absolute inset-0 bg-gradient-to-b from-paper/50 via-paper/40 to-paper/90" />
    </div>
  );
}
