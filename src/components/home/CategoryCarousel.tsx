import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { urlFor } from '@/sanity/imageUrl';
import Spinner from '@/components/fx/Spinner';
import type { SanityImage } from '@/sanity/types';

export type TeaserCard = {
  id: string;
  slug: string;
  label: string;
  coverImage: SanityImage | undefined;
};

type Props = {
  cards: TeaserCard[];
  viewWorksLabel: string;
};

/** How fast the carousel drifts on its own, in pixels per second.
 *  Slow enough to feel contemplative — about the same pace as a
 *  visitor reading the headlines above it. */
const AUTO_SPEED_PX_PER_S = 22;

/** Soft fade at each edge so cards dissolve into the paper texture
 *  instead of cutting at a hard rectangle. 8 % of width on each side. */
const EDGE_MASK =
  'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)';

/**
 * Horizontal category carousel. Auto-drifts right-to-left once the
 * section enters the viewport, pauses permanently the moment the
 * visitor takes over with a drag / swipe / wheel, and snap-centers
 * the cards when they let go.
 *
 * Cards are rendered twice so the auto-drift can loop seamlessly —
 * when scroll position crosses the half-width line, the component
 * jumps invisibly back by the same amount (both halves are
 * identical, the visitor never sees the seam).
 */
export default function CategoryCarousel({ cards, viewWorksLabel }: Props) {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  const [userTookOver, setUserTookOver] = useState(false);

  // Render the cards twice so we can loop the scroll position without
  // a visible jump — both halves show the same content so the swap
  // happens behind identical pixels.
  const doubled = useMemo(() => [...cards, ...cards], [cards]);

  // Auto-drift loop. Runs only when the section is in view, the user
  // hasn't grabbed it, and the visitor hasn't opted out of motion.
  useEffect(() => {
    if (!inView || userTookOver || reducedMotion) return;
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      el.scrollLeft += AUTO_SPEED_PX_PER_S * dt;
      // Seamless wrap: once we've drifted past the first copy of the
      // cards, jump back by exactly that distance. The two copies are
      // identical, so visually nothing changes.
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, userTookOver, reducedMotion]);

  // Any user interaction permanently hands control to them.
  const handTakeOver = () => setUserTookOver(true);

  return (
    <div ref={sectionRef} className="relative">
      {/*
        Force LTR direction on the scroll container so `scrollLeft`
        math is consistent across locales — `scrollLeft` semantics
        for RTL containers are inconsistent across browsers and would
        otherwise break the auto-drift loop. The visual cards still
        scroll the same direction for everyone; Hebrew visitors just
        get a left-handed scrollbar gesture that's still natural.
      */}
      <div
        ref={scrollerRef}
        dir="ltr"
        onTouchStart={handTakeOver}
        onMouseDown={handTakeOver}
        onWheel={handTakeOver}
        className="flex overflow-x-auto no-scrollbar snap-x snap-proximity gap-5 md:gap-7"
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
      >
        {/* Leading spacer so the first card can scroll to the centre
            of the container. Width is dynamic — half the container
            width minus half the card width — but we approximate with
            CSS so it stays responsive without a JS measurement. */}
        <div
          aria-hidden
          className="shrink-0 w-[calc(50%-7rem)] md:w-[calc(50%-9rem)]"
        />

        {doubled.map((card, i) => (
          <CarouselCard
            key={`${card.id}-${i}`}
            card={card}
            viewWorksLabel={viewWorksLabel}
          />
        ))}

        {/* Trailing spacer — mirror of the leading one so the last
            card can also reach centre. */}
        <div
          aria-hidden
          className="shrink-0 w-[calc(50%-7rem)] md:w-[calc(50%-9rem)]"
        />
      </div>

      {/* Affordance hint — fades the moment the user takes over. */}
      <div
        aria-hidden
        className={[
          'mt-10 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.176em] text-ink/40 transition-opacity duration-700',
          userTookOver ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <span className="inline-block">‹</span>
        <span>{t('home.dragToExplore')}</span>
        <span className="inline-block">›</span>
      </div>
    </div>
  );
}

/** A single card inside the carousel. Fixed width so the scroll math
 *  is predictable; portrait 3:4 image with a centred name underneath. */
function CarouselCard({
  card,
  viewWorksLabel,
}: {
  card: TeaserCard;
  viewWorksLabel: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <Link
      to={`/works/${card.slug}`}
      aria-label={`${viewWorksLabel} — ${card.label}`}
      className="group shrink-0 w-56 md:w-72 snap-center"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink/10 border border-ink/10 transition-colors duration-500 group-hover:border-ink/35">
        {/* Pulsing skeleton until the cover image is ready. */}
        <div
          aria-hidden
          className={[
            'absolute inset-0 flex items-center justify-center bg-ink/15 transition-opacity duration-500',
            loaded
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 animate-pulse',
          ].join(' ')}
        >
          <Spinner className="h-6 w-6 text-paper/60" />
        </div>
        {card.coverImage && (
          <img
            ref={imgRef}
            src={urlFor(card.coverImage)
              .width(600)
              .height(800)
              .auto('format')
              .url()}
            alt=""
            loading="lazy"
            width={600}
            height={800}
            onLoad={() => setLoaded(true)}
            className={[
              'absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-700 ease-gallery group-hover:scale-[1.04] group-hover:brightness-105 group-hover:saturate-110',
              loaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />
        )}
      </div>
      {/* Caption — quiet, centred, slightly larger than the eyebrow
          micro-type. Picks up teal on hover to echo the rest of the
          site's interactive language. */}
      <p className="mt-4 text-center font-display text-lg md:text-xl text-ink transition-colors duration-300 group-hover:text-teal">
        {card.label}
      </p>
    </Link>
  );
}
