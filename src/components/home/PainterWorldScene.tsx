import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useStopMotion } from '@/components/a11y/useStopMotion';

interface PainterWorldSceneProps {
  /** Looping video (autoplay/muted). Falls back to `posterSrc` if it can't load. */
  videoSrc: string;
  /** Still shown while the video loads, and instead of it for reduced motion. */
  posterSrc: string;
  /** The two lines over the film. Split explicitly rather than left to wrap,
   *  so the break lands in the same place in every language and at every
   *  window size. */
  quoteLine1: string;
  quoteLine2: string;
  /** Fires (on change only) when the film takes over the screen, so the page
   *  can lift the navbar out of the way — and again as the visitor moves on
   *  to the collections, so it comes back. */
  onNavHiddenChange?: (hidden: boolean) => void;
}

/**
 * "Painter's World" — a self-contained scene between the hero and the
 * collections.
 *
 * It plays ITSELF. Scrolling it into view is the only trigger: the frame opens
 * from a 4:5 portrait to a 16:9 landscape, the quote fades up over it, and a
 * few seconds later the scroll cue appears. Everything after that is on a
 * timer, not on the wheel.
 *
 * This replaced a pinned, scroll-scrubbed version. Tying the open to scroll
 * position meant the visitor was operating the animation instead of watching
 * it — it felt like dragging a slider, and every viewport height needed its
 * own tuning. A reveal-on-entry scene is the same idea with none of that: it
 * costs nothing during scroll (no rAF loop, no sticky stage, no per-frame
 * layout), so the page scrolls like any ordinary page.
 *
 * Reduced motion / "stop animations": the scene renders already open, with
 * controls on the video and no autoplay.
 */
export default function PainterWorldScene({
  videoSrc,
  posterSrc,
  quoteLine1,
  quoteLine2,
  onNavHiddenChange,
}: PainterWorldSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  /** True while the film is the thing on screen — drives the scroll cue, which
   *  must be able to come back, unlike the one-shot `open`. */
  const [ownsScreen, setOwnsScreen] = useState(false);

  const reduced = useReducedMotion();
  const stopMotion = useStopMotion();
  const still = (reduced ?? false) || stopMotion;

  useEffect(() => {
    // No motion wanted: show the finished state immediately.
    if (still) {
      setOpen(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true);
          io.disconnect(); // one-shot: it should never replay on scroll-back
        }
      },
      // Wait until a good part of the scene is on screen, so the open starts
      // when the visitor has arrived rather than as it clips the bottom edge.
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  // Play ONLY once the frame has begun opening, and only while it is on screen.
  //
  // The `open` half is what ties the film to its own reveal. Playback used to
  // hang off this observer alone, which carries 200px of margin and fires well
  // before the section is even in view — so the loop was already running, and
  // several seconds deep, by the time the frame started to expand. The visitor
  // met the film mid-thought. Gating on `open` starts it on the same beat as
  // the expansion, from its first frame.
  //
  // The on-screen half is about cost: this is the single most expensive thing
  // on the page — a continuous full-HD decode — and left to `autoplay loop` it
  // keeps running for the entire visit, including down at the collections or
  // the footer where it cannot be seen. That steady background load is what
  // makes scrolling feel like the machine is quietly struggling. Browsers
  // throttle offscreen video inconsistently, so we stop it outright.
  //
  // There is deliberately no `autoplay` attribute on the element: it would
  // start the moment the browser had enough data, which is exactly the early
  // playback this effect exists to prevent.
  useEffect(() => {
    const el = sectionRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    // Switching "stop animations" on (or setting reduced motion) has to stop a
    // film that is ALREADY playing — dropping the autoplay attribute does
    // nothing to a running video. WCAG 2.2.2 wants a way to stop content that
    // moves automatically for more than five seconds, and the widget is that
    // way; without this it made a promise it did not keep. The `still` branch
    // also renders native controls, so it can be restarted by choice.
    if (still) {
      video.pause();
      return;
    }

    let onScreen = false;
    const sync = () => {
      const shouldPlay =
        open && onScreen && document.visibilityState === 'visible';
      if (shouldPlay) void video.play().catch(() => {});
      else video.pause();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      // The margin keeps the film buffered and ready a little before it is
      // looked at; `open` is what decides when it may actually start.
      { rootMargin: '200px' },
    );
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
    // `open` re-runs this: the fresh observer reports the current intersection
    // immediately, so the film starts the instant the frame begins to expand.
  }, [still, open]);

  // The navbar steps aside while the film owns the screen, and returns as the
  // visitor moves on. A separate observer from the reveal above because it is
  // a different question — "is this still the thing on screen?" rather than
  // "has it been seen?" — and unlike the reveal it must keep firing, in both
  // directions, for as long as the page lives.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // The scroll cue lives on the same signal as the navbar: it is on
        // while the film owns the screen and off once it doesn't. It used to
        // hang off `data-open`, which is set once and never cleared, so the
        // arrows faded in exactly one time and were gone for good the moment
        // you scrolled past. A cue that cannot return is not a cue.
        setOwnsScreen(entry.isIntersecting);
        onNavHiddenChange?.(entry.isIntersecting);
      },
      // Crossing ~55% coverage in either direction: the nav lifts as the film
      // fills the screen and drops back as the collections take over.
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      onNavHiddenChange?.(false); // never strand the nav hidden on unmount
    };
  }, [onNavHiddenChange]);

  return (
    /* A plain block: one viewport tall, contents placed by ordinary padding.
       No scroll snapping — the visitor stops wherever they stop.

       161px top / 0 bottom sits the film 80px below dead centre (a centred flex
       child shifts by HALF the padding difference). Their SUM must match the
       figure --frame-max-h subtracts in index.css — shift the balance to move
       the film, change the sum to resize it. Zero bottom padding is fine
       because `mb-14` below provides the gap before the collections.

       No navbar allowance in the top padding: the nav lifts away while this
       section is on screen. */
    <section
      ref={sectionRef}
      data-open={open}
      data-cue={open && ownsScreen}
      /* Phones: `100svh` not `100vh`, and 88px of head room instead of 161.
         100vh on mobile is the LARGE viewport — the height with the browser
         toolbar retracted — so a 100vh section is taller than what you can
         actually see and pushes its own contents below the fold. `svh` is the
         small viewport, which is the honest figure.

         The padding drops because a 16:9 film in a portrait window can only
         ever be ~92vw wide, so it is about 194px tall on a phone; against
         161px of head room it floated near the bottom of an otherwise empty
         screen. 88px brings it back toward centre. `--frame-max-h` is
         overridden to match in index.css — the two must agree or the frame
         stops being 16:9. */
      className="pw-scene relative mb-14 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white px-4 pb-0 pt-[161px] max-md:min-h-[100svh] max-md:pt-[88px]"
    >
      {/* No drop shadow: on a white field it pooled as a grey smudge under the
          frame rather than reading as depth. The film sits flat on the page. */}
      {/* data-surface="dark": the quote sits on film over a near-black fill, so
          high-contrast mode must drive it white here, not near-black. */}
      <div
        data-surface="dark"
        className="pw-frame relative overflow-hidden rounded-2xl bg-flame-900"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          // No `autoPlay` — the effect above owns when this starts, so that the
          // first frame lands with the frame's expansion rather than ahead of
          // it. The poster holds the frame until then.
          controls={still}
          muted
          loop
          playsInline
          // Fetch as soon as the page opens, so it is ready by the time the
          // visitor scrolls down to it.
          preload="auto"
          className="h-full w-full rounded-2xl object-cover"
        />
        {/* Scrim — the quote sits over moving footage, so it needs a floor. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-black/35"
        />

        {/*
          Pull-quote, corner-anchored.

          The previous version stacked mark / words / mark as three flex rows
          with `leading-[0.42]` and negative margins. A 0.42 line-height on an
          11rem glyph means the character overflows its own line box by more
          than half its height, so whether it collided with the words depended
          entirely on the viewport — it was tuned, not solved, and at some
          widths the marks sat on the text.

          Now the two marks are absolutely positioned decoration on the OUTSIDE
          corners of a padded box, and the words are the only thing in normal
          flow. The invariant is simple and holds at every size because every
          value below is in `em` against the wrapper's own font-size:

            wrapper padding  >=  how far a mark reaches inward  ->  no overlap

          Marks are 2.6em and inset by -0.34em against 1.15em/0.75em of padding,
          so they sit in the gutter and lean outward, never inward. `start`/`end`
          are logical, so Hebrew mirrors the whole arrangement for free.
        */}
        <blockquote className="pw-quote pointer-events-none absolute inset-0 flex items-center justify-center px-6 md:px-12">
          <div className="relative text-[clamp(1.4rem,3.9vw,3.4rem)]">
            <span
              aria-hidden
              className="absolute -top-[0.34em] start-[-0.34em] select-none font-display text-[2.6em] leading-[0.8] text-primary drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]"
            >
              &ldquo;
            </span>
            <span
              aria-hidden
              className="absolute -bottom-[0.62em] end-[-0.34em] select-none font-display text-[2.6em] leading-[0.8] text-primary drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]"
            >
              &rdquo;
            </span>
            {/* px sized in em keeps the words clear of both marks; the text is
                the only thing in flow, so nothing can push into it. */}
            <p className="relative px-[1.15em] py-[0.75em] text-center font-display font-semibold leading-[1.2] text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.9)]">
              {quoteLine1}
              <br />
              {quoteLine2}
            </p>
          </div>
        </blockquote>

        {/* Scroll cue — on the film itself, at its foot. Arrives four seconds
            after the quote has finished landing (the delay lives in CSS), so
            it reads as "you've had your moment, there's more below" rather
            than hurrying the visitor along. */}
        <div
          aria-hidden
          className="pw-arrows pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center"
        >
          {[0, 1, 2].map((i) => (
            <ChevronDown
              key={i}
              strokeWidth={2.25}
              className={`scroll-chev h-8 w-8 text-flame-50 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] md:h-10 md:w-10 ${i > 0 ? '-mt-[16px] md:-mt-[20px]' : ''}`}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
