import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { urlFor, cardUrls } from '@/sanity/imageUrl';
import { pickLocale } from '@/lib/pickLocale';
import { mod } from '@/lib/mod';
import { cn } from '@/lib/utils';
import { ctaClasses } from '@/components/ui/cta-style';
import Reveal from '@/components/fx/Reveal';
import { useStopMotion } from '@/components/a11y/useStopMotion';
import type { Category } from '@/sanity/types';

/** Base spring for spatial movement (x / z / rotateY). */
const BASE_SPRING = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
} as const;

/** Bouncier spring for the scale change — the "tap" landing of the centre card. */
const TAP_SPRING = {
  type: 'spring',
  stiffness: 450,
  damping: 18,
  mass: 1,
} as const;

/**
 * Horizontal distance between neighbouring cards, in px. Tracks the md
 * breakpoint reactively (SSG renders the desktop value; the client corrects
 * on hydration and on resize).
 */
function useCardStep() {
  const [step, setStep] = React.useState(330);
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setStep(mq.matches ? 330 : 250);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return step;
}

/**
 * Category focus rail — the "bodies of work" showcase on the landing page.
 *
 * A 3D rail of category cover cards on a clean white field: the active
 * collection stands face-on in the centre while its neighbours recede in
 * perspective, blurred and dimmed. A soft, blurred echo of the active cover
 * washes the backdrop so the whole section breathes with each collection's
 * palette. Below the rail: the collection's name, description and painting
 * count, a prev/counter/next control pill, and a link into its gallery.
 *
 * Driving it: chevrons, ← / → keys (rail is focusable), horizontal
 * trackpad/wheel gestures (vertical page scrolling is deliberately left
 * alone), drag/swipe, or clicking a side card.
 */
export default function CategoryFocusRail({
  categories,
}: {
  categories: Category[];
}) {
  const { locale, t } = useLocale();
  const stopMotion = useStopMotion();
  const shouldReduceMotion = (useReducedMotion() ?? false) || stopMotion;
  const cardStep = useCardStep();
  const [active, setActive] = React.useState(0);
  const lastWheelTime = React.useRef(0);
  // Running total of the current wheel gesture, and when it last emitted —
  // together these turn a stream of small trackpad deltas into one intentional
  // step instead of discarding almost all of them. See `onWheel`.
  const wheelAccum = React.useRef(0);
  const lastWheelEvent = React.useRef(0);
  // Stamped on drag end; clicks that land right after a committed swipe are
  // ignored so one gesture can't advance the rail twice.
  const lastDragEnd = React.useRef(0);

  // Only categories with a cover can be shown as cards.
  const items = React.useMemo(
    () => categories.filter((c) => c.coverImage),
    [categories],
  );
  const count = items.length;

  const urls = React.useMemo(
    () => cardUrls(items.map((c) => c.coverImage!), 600, 800),
    [items],
  );

  // Tiny pre-blurred CDN renditions for the background ambience — the heavy
  // blur happens once on Sanity's side, so the client never has to repaint a
  // viewport-sized 64px CSS blur on every slide change.
  const bgUrls = React.useMemo(
    () =>
      items.map((c) =>
        urlFor(c.coverImage!)
          .width(96)
          .height(128)
          .fit('crop')
          .blur(40)
          .auto('format')
          .url(),
      ),
    [items],
  );

  const activeIndex = count > 0 ? mod(active, count) : 0;
  const activeItem = items[activeIndex];

  const handlePrev = React.useCallback(() => setActive((p) => p - 1), []);
  const handleNext = React.useCallback(() => setActive((p) => p + 1), []);

  // Horizontal wheel / trackpad navigation. Vertical deltas are ignored so the
  // rail never hijacks normal page scrolling.
  //
  // This is what made the rail feel "stuck". The old version hard-dropped every
  // wheel event for 400ms after a step and required a single event to exceed
  // 20px. A trackpad glide emits a continuous stream of small deltas at
  // 60-120Hz, so almost all of the gesture was discarded: the rail advanced in
  // ~2.5 discrete lurches per second no matter how you moved, and the motion
  // was decoupled from the hand.
  //
  // Now the gesture is ACCUMULATED — every event adds to a running total and a
  // step fires when it crosses the threshold, so slow and fast glides both
  // track the hand. The lockout stays only to stop one flick becoming three,
  // and is short enough to feel continuous. The accumulator resets on
  // direction change so a reversal responds immediately, and after a pause so
  // trailing inertia does not bleed into the next gesture.
  const WHEEL_STEP = 60;
  const WHEEL_LOCKOUT = 220;
  const WHEEL_IDLE_RESET = 180;
  const onWheel = React.useCallback(
    (e: React.WheelEvent) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!isHorizontal && !e.shiftKey) return;
      const delta = isHorizontal ? e.deltaX : e.deltaY;

      const now = performance.now();
      if (
        now - lastWheelEvent.current > WHEEL_IDLE_RESET ||
        Math.sign(delta) !== Math.sign(wheelAccum.current)
      ) {
        wheelAccum.current = 0;
      }
      lastWheelEvent.current = now;

      if (now - lastWheelTime.current < WHEEL_LOCKOUT) return;

      wheelAccum.current += delta;
      if (Math.abs(wheelAccum.current) >= WHEEL_STEP) {
        if (wheelAccum.current > 0) handleNext();
        else handlePrev();
        wheelAccum.current = 0;
        lastWheelTime.current = now;
      }
    },
    [handleNext, handlePrev],
  );

  // Physical arrow keys to match the physical card motion (same feel in
  // Hebrew and English).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Swipe: past this "power" (offset × velocity) the drag commits to a move.
  const swipeConfidenceThreshold = 10000;
  const onDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo,
  ) => {
    lastDragEnd.current = performance.now();
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -swipeConfidenceThreshold) handleNext();
    else if (swipe > swipeConfidenceThreshold) handlePrev();
  };

  if (count === 0) return null;

  const title = pickLocale(activeItem.title, locale);
  const description = pickLocale(activeItem.description, locale);

  // With fewer than 5 items, wrapping ±2 would show the same card twice —
  // shrink the visible window instead.
  const half = Math.min(2, Math.floor((count - 1) / 2));
  const visibleOffsets: number[] = [];
  for (let o = -half; o <= half; o++) visibleOffsets.push(o);

  const cardTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        x: BASE_SPRING,
        z: BASE_SPRING,
        rotateY: BASE_SPRING,
        scale: TAP_SPRING,
        opacity: { duration: 0.35 },
        filter: { duration: 0.35 },
      };

  return (
    /* NO negative top margin. It used to be pulled up 60vh to close the gap
       below the film, but this section paints OVER that section's pinned
       stage, so the overlap sheared the video's bottom corners off as it
       lifted away. The film's commit scrolls the page straight here now, so
       there is no gap left to hide. Do not reintroduce an overlap. */
    /* A plain block: at least one viewport tall, contents placed by ordinary
       padding. No scroll snapping — the visitor stops wherever they stop.
       POSITIONING: `pt` alone places the whole rail — header, cards and
       controls together — and it maps 1:1, so to move the rail by N pixels
       change this one number by N.

       That only holds because there is deliberately NO min-h-screen and NO
       justify-center here. With those, the section's height flipped between
       "grown by its content" and "held at one viewport" depending on the
       window, and centring silently switched between doing nothing and
       halving every adjustment — which is why earlier nudges landed short.
       Height is now simply padding + content, identical everywhere.

       The 160px underneath, plus the spacer the landing page adds after this
       section, keeps the footer clear of the rail (see HomeLanding). */
    <section
      id="collections"
      className="relative flex w-full flex-col overflow-hidden bg-white pb-[160px] pt-[32px]"
    >
      {/* Background ambience — a blurred, pre-rendered echo of the active
          cover, veiled in white so it reads as atmosphere, not image. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${activeItem._id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: shouldReduceMotion ? 0 : 0.22 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.8,
              ease: 'easeOut',
            }}
            className="absolute inset-0"
          >
            <img
              src={bgUrls[activeIndex]}
              alt=""
              // No CSS blur: the source is already a 96px, blur(40) rendition
              // from Sanity, so stacking a filter on top only bought a
              // full-viewport filter layer for the compositor to maintain
              // while the page scrolls.
              className="h-full w-full object-cover saturate-150"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/60 to-white" />
      </div>

      {/* Section header */}
      <Reveal className="relative z-10 mb-5 px-6 text-center md:mb-6" amount={0.4}>
        <header>
          {/* The shared section-header trio (see index.css) — the Works page
              introduces itself with exactly these three styles. */}
          <p className="eyebrow mb-2">{t('showcase.eyebrow')}</p>
          <h2 className="section-title">{t('showcase.title')}</h2>
          <p className="section-subtitle mx-auto mt-3 max-w-md">
            {t('showcase.subtitle')}
          </p>
        </header>
      </Reveal>

      {/* Main stage */}
      <div className="relative z-10 flex flex-col justify-center px-4 md:px-8">
        {/* Draggable rail. dir="ltr" pins the geometry so the physical
            transforms, drag math and wheel deltas agree across locales. */}
        <motion.div
          dir="ltr"
          role="group"
          aria-label={t('showcase.title')}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onWheel={onWheel}
          className="relative mx-auto flex h-[340px] w-full max-w-6xl cursor-grab items-center justify-center [perspective:1200px] active:cursor-grabbing md:h-[420px]"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {visibleOffsets.map((offset) => {
            const absIndex = active + offset;
            const index = mod(absIndex, count);
            const item = items[index];

            const isCenter = offset === 0;
            const dist = Math.abs(offset);

            return (
              <motion.div
                key={absIndex}
                className={cn(
                  'absolute aspect-[3/4] w-[230px] rounded-md border border-ink/10 bg-mist md:w-[300px]',
                  isCenter
                    ? 'z-20 shadow-[0_32px_64px_-28px_rgba(37,36,34,0.4)]'
                    : 'z-10 shadow-xl',
                )}
                initial={false}
                animate={{
                  x: offset * cardStep,
                  z: -dist * 180,
                  scale: isCenter ? 1 : 0.85,
                  rotateY: offset * -20,
                  opacity: isCenter ? 1 : Math.max(0.12, 1 - dist * 0.45),
                  filter: `blur(${isCenter ? 0 : dist * 5}px) brightness(${isCenter ? 1 : 0.75})`,
                }}
                transition={cardTransition}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => {
                  // Swallow the click that trails a committed swipe gesture.
                  if (performance.now() - lastDragEnd.current < 300) return;
                  if (offset !== 0) setActive((p) => p + offset);
                }}
              >
                <img
                  src={urls[index]}
                  alt={pickLocale(item.title, locale)}
                  width={600}
                  height={800}
                  // NOT lazy. `absIndex` is the key, so every step mounts a
                  // card whose image has never been requested — lazy guaranteed
                  // it was not preloaded, and without `decoding="async"` the
                  // browser could decode 600x800 synchronously on the main
                  // thread, mid-spring. That is a dropped-frame hitch on every
                  // step until the visitor has been round the rail once. These
                  // are five in-view images, not a long feed; eager + async
                  // decode is the correct pairing here.
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  className="pointer-events-none h-full w-full rounded-md object-cover"
                />
                {/* Lighting layers — a top sheen and a whisper of depth. */}
                <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-b from-white/15 to-transparent" />
                {/* Plain fill, not `mix-blend-multiply`. A blend mode forces
                    the compositor to read back the backdrop and re-blend every
                    frame, and blocks the card from being promoted to its own
                    layer — while the card is simultaneously moving in x, z,
                    rotateY and scale, so the backdrop under it changes
                    constantly and the blend can never be cached. At 5% opacity
                    multiply and normal differ by well under 2% luminance: the
                    look is preserved, the per-frame readback is not. */}
                <div className="pointer-events-none absolute inset-0 rounded-md bg-flame-900/5" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info & controls */}
        <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col items-center justify-between gap-6 md:mt-12 md:flex-row">
          <div className="flex h-32 flex-1 flex-col items-center justify-center text-center md:items-start md:text-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem._id}
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 10, filter: 'blur(4px)' }
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={
                  shouldReduceMotion
                    ? undefined
                    : { opacity: 0, y: -10, filter: 'blur(4px)' }
                }
                transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                className="space-y-2"
              >
                {/* Everything in this block is the UI face (Assistant) — only
                    the section's own big title above uses the display serif,
                    so the rail carries exactly two typefaces. */}
                {typeof activeItem.count === 'number' &&
                  activeItem.count > 0 && (
                    <span className="font-sans text-xs font-semibold uppercase tracking-[0.176em] text-accent-ink">
                      {t('showcase.worksCount', { count: activeItem.count })}
                    </span>
                  )}
                <h3 className="font-sans text-3xl font-medium tracking-tight text-ink md:text-4xl">
                  {title}
                </h3>
                {description && (
                  <p className="max-w-md font-sans text-slate">{description}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            {/* Stepper — squared off to rounded-md so it belongs to the same
                family as the CTA beside it, with the counter promoted from a
                12px whisper to the pill's anchor. Each arrow gets a filled
                hover plate rather than a colour shift, so the target reads
                before you're on it. dir=ltr pins the arrow order to the
                physical card motion, which is the same in both languages. */}
            <div
              // Solid white rather than translucent + backdrop-blur:
              // backdrop-filter forces the compositor to re-sample whatever is
              // behind it on every scrolled frame, and against this near-white
              // section it bought nothing visible.
              className="flex h-14 items-center gap-1 rounded-md border-2 border-line bg-white px-1.5 shadow-sm"
              dir="ltr"
            >
              <button
                type="button"
                onClick={handlePrev}
                aria-label={t('showcase.prev')}
                className="rounded-md p-2.5 text-slate transition-colors duration-200 hover:bg-ink hover:text-paper active:scale-95"
              >
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <span className="min-w-[64px] text-center font-sans text-base font-bold tabular-nums text-ink">
                {activeIndex + 1}
                <span className="mx-1 font-normal text-slate/70">/</span>
                <span className="font-normal text-slate">{count}</span>
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label={t('showcase.next')}
                className="rounded-md p-2.5 text-slate transition-colors duration-200 hover:bg-ink hover:text-paper active:scale-95"
              >
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </div>

            {/* Same button language as the hero CTA (ui/cta-style.ts), in the
                light-surface tone and the compact size so it matches the
                stepper beside it. Different job: this opens one gallery. */}
            <Link
              to={`/works/${activeItem.slug}`}
              className={ctaClasses('onLight', 'sm')}
            >
              <span className="relative z-10 inline-flex items-center gap-[0.6em]">
                {t('showcase.explore')}
                <ArrowUpRight
                  aria-hidden
                  className="h-[1.05em] w-[1.05em] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
