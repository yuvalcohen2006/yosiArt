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

  // Horizontal wheel / trackpad navigation. Vertical deltas are ignored so
  // the rail never hijacks normal page scrolling; a 400ms lockout absorbs
  // trackpad inertia.
  const onWheel = React.useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 400) return;
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!isHorizontal && !e.shiftKey) return;
      const delta = isHorizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) > 20) {
        if (delta > 0) handleNext();
        else handlePrev();
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
    <section
      id="collections"
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-white py-24"
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
              className="h-full w-full object-cover blur-md saturate-150"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/60 to-white" />
      </div>

      {/* Section header */}
      <Reveal className="relative z-10 mb-12 px-6 text-center md:mb-16" amount={0.4}>
        <header>
          <p className="eyebrow mb-3">{t('showcase.eyebrow')}</p>
          <h2 className="font-display text-4xl font-semibold text-ink md:text-5xl">
            {t('showcase.title')}
          </h2>
          {/* Painted underline — a real acrylic smear in the flame palette
              (multiply-blended so its white paper vanishes into the page).
              Mirrored in RTL so the stroke "starts" at the reading edge. */}
          <img
            src="/assets/paint-stroke.jpg"
            alt=""
            aria-hidden
            draggable={false}
            className="mx-auto mt-4 w-40 select-none mix-blend-multiply md:w-52 rtl:-scale-x-100"
          />
          <p className="mx-auto mt-4 max-w-md text-slate">
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
          className="relative mx-auto flex h-[340px] w-full max-w-6xl cursor-grab items-center justify-center outline-none [perspective:1200px] active:cursor-grabbing md:h-[420px]"
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
                  loading="lazy"
                  draggable={false}
                  className="pointer-events-none h-full w-full rounded-md object-cover"
                />
                {/* Lighting layers — a top sheen and a whisper of depth. */}
                <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-b from-white/15 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-md bg-flame-900/5 mix-blend-multiply" />
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
                {typeof activeItem.count === 'number' &&
                  activeItem.count > 0 && (
                    <span className="text-xs font-medium uppercase tracking-[0.176em] text-primary">
                      {t('showcase.worksCount', { count: activeItem.count })}
                    </span>
                  )}
                <h3 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                  {title}
                </h3>
                {description && (
                  <p className="max-w-md text-slate">{description}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1 rounded-full border border-line bg-white/80 p-1 shadow-sm backdrop-blur-md"
              dir="ltr"
            >
              <button
                type="button"
                onClick={handlePrev}
                aria-label={t('showcase.prev')}
                className="rounded-full p-3 text-slate transition hover:bg-ink/5 hover:text-ink active:scale-95"
              >
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <span className="min-w-[44px] text-center text-xs tabular-nums text-slate">
                {activeIndex + 1} / {count}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label={t('showcase.next')}
                className="rounded-full p-3 text-slate transition hover:bg-ink/5 hover:text-ink active:scale-95"
              >
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </div>

            <Link
              to={`/works/${activeItem.slug}`}
              className="group flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary active:translate-y-0 active:scale-95"
            >
              {t('showcase.explore')}
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
