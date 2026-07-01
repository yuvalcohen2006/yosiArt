import { useEffect, useState } from 'react';
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
  const src = urlFor(current)
    .width(800)
    .height(1000)
    .fit('crop')
    .auto('format')
    .url();
  const alt =
    (locale === 'he' ? current.altHe : current.alt) ?? current.alt ?? '';

  return (
    <div className="w-full">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-ink/5">
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
