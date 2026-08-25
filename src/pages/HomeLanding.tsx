import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import Tabnavbar from '@/components/ui/navbar';
import { useLocale } from '@/hooks/useLocale';
import { GetStartedButton } from '@/components/ui/get-started-button';
import { useLoaderData } from 'react-router-dom';
import HeroArtworkCarousel from '@/components/hero/HeroArtworkCarousel';
import CategoryFocusRail from '@/components/home/CategoryFocusRail';
import PainterWorldScene from '@/components/home/PainterWorldScene';
import { motionStopped } from '@/components/a11y/useStopMotion';
import { Spotlight, GridBackground, StageWash } from '@/components/fx/Spotlight';
import type { Category, HomeMedia } from '@/sanity/types';

/**
 * The painter's-world film. A 10.5s seamless loop cut from Yosi's garden
 * footage — see scripts/encodePainterVideo.mjs for how it's rendered from the
 * camera master, and why it's a build asset rather than a Sanity upload.
 */
const PAINTER_VIDEO = '/assets/painter-loop.mp4';
const PAINTER_POSTER = '/assets/painter-poster.jpg';

// useLayoutEffect on the client (run before paint), useEffect on the server
// (SSG) to avoid the React warning.
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Hero headline — two lines in Frank Ruhl Libre (semibold), start-aligned in
 * the frame's white centre.
 *
 * Entrance animation ported ONLY from the reference component's `introTl`
 * timeline (nothing else): the top line fades + moves up (blur/scale/tilt out),
 * then the bottom line reveals via a clip-path wipe, overlapping. The same
 * entrance re-plays whenever the language toggles (keyed on `locale`).
 *
 * Font / wording / weight are intentionally unchanged.
 */
function HeroHeadline() {
  const { t, locale } = useLocale();
  const line1 = t('hero.title1');
  const line2 = t('hero.title2');
  const rootRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === 'he';

  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // OS preference OR the accessibility widget's "stop animations" mode
      // (GSAP writes inline styles the CSS kill-switch can't reach).
      const reduce =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        motionStopped();

      if (reduce) {
        gsap.set(['.hero-l1', '.hero-l2', '.hero-cta'], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          clipPath: 'inset(0 0% 0 0)',
        });
        return;
      }

      // top line: fades up (blur + scale + tilt resolve)
      gsap.set('.hero-l1', {
        autoAlpha: 0,
        y: 60,
        scale: 0.85,
        filter: 'blur(20px)',
        rotationX: -20,
      });
      // bottom line: visible but clipped, revealed by the wipe (mirror the wipe
      // direction for RTL so it reveals from the reading start)
      gsap.set('.hero-l2', {
        autoAlpha: 1,
        clipPath: isRtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)',
      });
      // CTA starts hidden; it appears only as the final timeline step.
      gsap.set('.hero-cta', { autoAlpha: 0, y: 20 });

      gsap
        .timeline({ delay: 0.3 })
        .to('.hero-l1', {
          duration: 1.8,
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          rotationX: 0,
          ease: 'expo.out',
        })
        .to(
          '.hero-l2',
          {
            duration: 1.4,
            // The end state must mirror the START per direction so only ONE
            // edge animates 100%→0% with matching units. Sharing a single
            // `inset(0 0% 0 0)` end worked in LTR (right→0%) but left the RTL
            // tween mismatched (start clips the LEFT), so GSAP couldn't
            // interpolate it and line 2 stayed fully clipped — invisible.
            clipPath: isRtl ? 'inset(0 0 0 0%)' : 'inset(0 0% 0 0)',
            ease: 'power4.inOut',
          },
          '-=1.0',
        )
        // Appended AFTER the text entrance: the button fades in once BOTH
        // lines have finished — sequenced on the timeline, not a guessed delay.
        .to('.hero-cta', {
          duration: 0.7,
          autoAlpha: 1,
          y: 0,
          ease: 'power2.out',
        });
    }, rootRef);
    return () => ctx.revert();
  }, [locale]);

  return (
    /* The hero's voice — on the dark stage, so everything is light type.
       Centred on mobile (stacked layout), start-aligned beside the carousel
       from md up. `whitespace-nowrap` means the two lines must never wrap, so
       keep the clamp's vw term below what the column can hold if you retune. */
    <div ref={rootRef} className="text-center md:text-start">
      <h1 className="sr-only">{`${line1} ${line2}`}</h1>
      {/* No `invisible` class on any of these — the static prerendered HTML
          ships the hero fully visible (SEO, no-JS, LCP), and the GSAP layout
          effect hides + re-reveals post-hydration, before paint. Hidden
          states baked into markup would blank the page for every visitor
          whose JS hasn't landed yet. */}
      {/* Pure white, both lines — no tonal split. The only colour in the
          statement is the accent dot that lands it. */}
      <div
        aria-hidden
        className="font-display text-[clamp(2rem,5.6vw,5.9rem)] font-semibold leading-[1.04] text-white"
        style={{ perspective: '800px' }}
      >
        <div className="hero-l1 whitespace-nowrap">{line1}</div>
        <div className="hero-l2 whitespace-nowrap">
          {line2}
          <span className="text-primary">.</span>
        </div>
      </div>
      {/* CTA — faded in by the timeline above. */}
      <div className="hero-cta mt-10 flex justify-center md:justify-start">
        <GetStartedButton />
      </div>
    </div>
  );
}

/**
 * Landing — three full-width acts on a white field:
 *
 *   navbar · hero stage    — lit gallery wall; headline + CTA on the dark
 *                            panel at the left, artwork hanging in the lamp's
 *                            light at the right
 *          · painter's world — the film opens up, then lifts away…
 *          · collections     — …uncovering the category rail behind it
 *
 * (The original Home.tsx + the earlier shader backgrounds are still in the
 * repo, unused, until the new design is locked.)
 */
export default function HomeLanding() {
  const { t } = useLocale();
  // The '/' route loader fetches the homeMedia singleton (hero carousel
  // image set) plus the category list (focus-rail showcase) in one pass —
  // no client-side queries, no hardcoded URLs.
  const data = useLoaderData() as
    | { homeMedia?: HomeMedia | null; categories?: Category[] }
    | undefined;
  const heroImages = data?.homeMedia?.heroImages ?? [];
  const categories = data?.categories ?? [];
  // The painter's-world film lifts the navbar out while it owns the screen,
  // and hands it back as the collections come into view.
  const [navHidden, setNavHidden] = useState(false);
  // The hero's scroll cue retires permanently on first scroll — it has done
  // its one job by then, and a cue that keeps pulsing reads as nagging.
  const [cueGone, setCueGone] = useState(false);
  useEffect(() => {
    if (cueGone) return;
    const dismiss = () => setCueGone(true);
    window.addEventListener('scroll', dismiss, { once: true, passive: true });
    return () => window.removeEventListener('scroll', dismiss);
  }, [cueGone]);
  return (
    <div className="bg-white">
      <SEO path="/" description={null} />
      <Tabnavbar
        hidden={navHidden}
        categories={categories}
        featuredImage={heroImages[0]}
      />
      {/* Hero — the navbar and this section together come to exactly ONE
          viewport, hard-clipped. The navbar sits in normal flow above (sticky,
          not fixed), so a plain `h-screen` would hang the hero's foot ~100px
          below the fold; subtracting --nav-h cuts it clean — the moment you
          scroll a pixel the hero is done. `svh` so mobile chrome can't push it
          over either.

          No photo. The stage is #0A0A0A: a fine grid, two soft beams raking in
          from the top corners, and the artwork's own glow in the column below
          (.hero-art-glow), centred on the carousel so it can never drift
          off-centre as the viewport changes. Every layer here is aria-hidden
          decoration at z-0; the layout never depends on any of it. */}
      {/* data-surface="dark": tells high-contrast mode this whole stage is a
          dark field, so its text goes white rather than near-black. */}
      <section
        data-surface="dark"
        className="relative h-[calc(100svh-var(--nav-h))] w-full overflow-hidden bg-stage"
      >
        {/* Order is the lighting order, and it matters. The wash lays the
            charcoal down first, the beams rake across it, and the grid goes on
            LAST so the rim texture stays crisp instead of being dimmed by
            everything painted after it — which is what happened while the old
            vignette sat on top.
            `interactive`: the grid lights up faintly under the cursor, and only
            where there is grid to light. */}
        <StageWash />
        <Spotlight />
        <GridBackground interactive torchOpacity="0.16" />

        {/* Composition — compact two-column: voice left, artwork right;
            stacked and centred on small screens. */}
        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col items-center justify-center gap-10 px-8 md:flex-row md:justify-between md:gap-12 lg:px-12">
          <HeroHeadline />

          {heroImages.length > 0 && (
            <div className="flex shrink-0 flex-col items-center">
              {/* Gallery plaque above the artwork — a kicker, so it recedes.
                  At 13px in warm flame-300 (not near-white) with wide tracking
                  it reads as the small caption on a museum wall label rather
                  than a heading competing with the painting it introduces. An
                  18px near-white version outweighed the artwork; a plaque
                  should be the quietest thing in its corner. */}
              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.2em] text-flame-300">
                {t('heroCarousel.title')}
              </p>
              {/* The glow is a sibling of the artwork, centred on this box, so
                  it is symmetrical at every viewport width and in both reading
                  directions. It sits outside the floating wrapper so the light
                  stays put and breathes while the art drifts — two slow
                  movements out of phase rather than one rigid one. */}
              <div className="relative">
                <div
                  aria-hidden
                  className="hero-art-glow pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                />
                {/* hero-art-float: slow idle drift (index.css). */}
                <div className="hero-art-float relative w-[200px] sm:w-[230px] lg:w-[270px]">
                  <HeroArtworkCarousel images={heroImages} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll cue — three big chevrons cascading down at the stage's foot,
            each flickering a beat after the one above so the pulse travels
            downward. Pure CSS animation (reduced motion holds them steady but
            VISIBLE — orientation is exactly what those visitors still need);
            fades out for good the first time the visitor actually scrolls. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center transition-opacity duration-700 ${cueGone ? 'opacity-0' : 'opacity-100'}`}
        >
          {[0, 1, 2].map((i) => (
            <ChevronDown
              key={i}
              strokeWidth={2.25}
              className={`scroll-chev h-9 w-9 text-flame-50 md:h-11 md:w-11 ${i > 0 ? '-mt-[18px] md:-mt-[22px]' : ''}`}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </section>

      {/* "Painter's World" — a self-playing scene: scrolling it into view
          opens the frame, then the quote, then the scroll cue. Nothing here
          is driven by scroll position. */}
      <PainterWorldScene
        videoSrc={PAINTER_VIDEO}
        posterSrc={PAINTER_POSTER}
        quoteLine1={t('painterWorld.quoteLine1')}
        quoteLine2={t('painterWorld.quoteLine2')}
        onNavHiddenChange={setNavHidden}
      />

      {/* Collections showcase — the reveal the video lifts to uncover. */}
      <CategoryFocusRail categories={categories} />

      {/* Runway before the footer.
          Without it, reaching the bottom of the page clamps the scroll while
          the rail is still partly on screen — so scrolling back up never
          returns it to where it sat on the way down, and the composition
          reads as off-centre. This plus the rail's own bottom padding puts a
          full viewport between the rail and the footer, so the bottom of the
          document can't disturb how the rail sits. */}
      <div aria-hidden className="h-56 w-full bg-white" />
    </div>
  );
}
