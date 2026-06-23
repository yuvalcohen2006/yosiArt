import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

/** Auto-drift speed in pixels per second. Slow enough to read as
 *  "alive" rather than marquee — about half the pace of an unhurried
 *  read. */
const AUTO_SPEED_PX_PER_S = 30;

/** Quiet window after the last user input before auto-drift resumes.
 *  Long enough that touch-momentum has mostly decayed before our
 *  motion joins back in, short enough that the carousel feels like
 *  it picks up again right after the visitor lets go. */
const RESUME_AFTER_INTERACTION_MS = 1000;

/** Soft fade at each edge so cards dissolve into the paper texture
 *  instead of cutting at a hard rectangle. */
const EDGE_MASK =
  'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)';

/**
 * Horizontal category carousel with a truly seamless infinite loop.
 *
 * Cards are rendered three times back-to-back; on mount we park
 * `scrollLeft` at the start of the middle copy so there's always a
 * full set of cards visible to both the left *and* the right. When
 * the scroll position crosses into copy 1 or copy 3 (either via
 * auto-drift or user pan), we silently warp `scrollLeft` back by one
 * set width — visually nothing changes because both copies render
 * identical content.
 *
 * Auto-drift uses a fractional-pixel accumulator so motion at <1 px
 * per frame still advances — otherwise the browser rounds each
 * assignment back to the same integer and the carousel sits still.
 */
export default function CategoryCarousel({ cards, viewWorksLabel }: Props) {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });
  const reducedMotion = useReducedMotion();
  // The hint caption fades the first time the visitor interacts and
  // stays faded — re-fading it back in on every auto-resume would
  // feel naggy.
  const [hintFaded, setHintFaded] = useState(false);
  // Stamped on every interaction. Auto-drift waits
  // RESUME_AFTER_INTERACTION_MS past this before advancing again.
  const lastInteractionRef = useRef(0);

  // 3 copies of the cards so we can warp the scroll position by one
  // set-width without anyone noticing — there's always a copy of the
  // cards still visible on both sides of the warp boundary.
  const tripled = useMemo(
    () => [...cards, ...cards, ...cards],
    [cards],
  );

  // Park the carousel at the start of the middle copy on first paint
  // (and any time the card set changes). useLayoutEffect runs before
  // the browser commits to screen, so visitors never see scrollLeft=0.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const setW = el.scrollWidth / 3;
    if (setW > 0) el.scrollLeft = setW;
  }, [cards.length]);

  // Warp the scroll position whenever it crosses into copy 1 or
  // copy 3 — handles both auto-drift overshoot and user pan.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let pending = 0;
    const onScroll = () => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        const setW = el.scrollWidth / 3;
        if (setW <= 0) return;
        if (el.scrollLeft >= 2 * setW) el.scrollLeft -= setW;
        else if (el.scrollLeft <= 0) el.scrollLeft += setW;
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (pending) cancelAnimationFrame(pending);
    };
  }, [cards.length]);

  // Auto-drift loop. Accumulator pattern so motion at <1 px per
  // frame still advances — assigning `scrollLeft += 0.4` does
  // nothing because the browser rounds the new value to the same
  // integer it had before. We don't stop the RAF on interaction;
  // we just gate the per-frame advance on whether the quiet window
  // has elapsed since the visitor last touched the carousel. That
  // way the auto-drift can pick up again automatically once they
  // settle, without us re-mounting effects every time.
  useEffect(() => {
    if (!inView || reducedMotion) return;
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const sinceInteraction = now - lastInteractionRef.current;
      if (sinceInteraction >= RESUME_AFTER_INTERACTION_MS) {
        acc += AUTO_SPEED_PX_PER_S * dt;
        if (acc >= 1) {
          const whole = Math.floor(acc);
          el.scrollLeft += whole;
          acc -= whole;
        }
      } else {
        // Quiet window — drop any accumulated motion so we don't
        // burst-advance the second the visitor releases.
        acc = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reducedMotion]);

  // Any user input resets the quiet window. We also listen for
  // `touchmove` so an in-progress drag keeps the timer pinned, and
  // for `wheel` so a continuous scroll gesture does the same.
  const handInteraction = () => {
    lastInteractionRef.current = performance.now();
    if (!hintFaded) setHintFaded(true);
  };

  return (
    <div ref={sectionRef} className="relative">
      <div
        ref={scrollerRef}
        // Force LTR direction so scrollLeft math is consistent across
        // locales — RTL containers have inconsistent scrollLeft
        // semantics across browsers (some go negative, some don't),
        // which would break the warp loop.
        dir="ltr"
        onTouchStart={handInteraction}
        onTouchMove={handInteraction}
        onMouseDown={handInteraction}
        onWheel={handInteraction}
        className="flex overflow-x-auto no-scrollbar gap-5 md:gap-7"
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
      >
        {tripled.map((card, i) => (
          <CarouselCard
            key={`${card.id}-${i}`}
            card={card}
            viewWorksLabel={viewWorksLabel}
          />
        ))}
      </div>

      {/* Affordance hint — fades out the moment the user takes over,
          stays faded even after auto-drift resumes. */}
      <div
        aria-hidden
        className={[
          'mt-10 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.176em] text-ink/40 transition-opacity duration-700',
          hintFaded ? 'opacity-0' : 'opacity-100',
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
      className="group shrink-0 w-56 md:w-72"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink/10 border border-ink/10 transition-colors duration-500 group-hover:border-ink/35">
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
      <p className="mt-4 text-center font-display text-lg md:text-xl text-ink transition-colors duration-300 group-hover:text-teal">
        {card.label}
      </p>
    </Link>
  );
}
