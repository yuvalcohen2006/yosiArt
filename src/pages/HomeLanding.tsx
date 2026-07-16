import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import SEO from '@/components/seo/SEO';
import Tabnavbar from '@/components/ui/navbar';
import { useLocale } from '@/hooks/useLocale';
import { GetStartedButton } from '@/components/ui/get-started-button';
import { useLoaderData } from 'react-router-dom';
import HeroArtworkCarousel from '@/components/hero/HeroArtworkCarousel';
import CategoryFocusRail from '@/components/home/CategoryFocusRail';
import PainterWorldScroll from '@/components/home/PainterWorldScroll';
import { motionStopped } from '@/components/a11y/useStopMotion';
import type { Category, HomeMedia } from '@/sanity/types';

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
          { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' },
          '-=1.0',
        )
        // Appended AFTER the text entrance: the button fades in once BOTH lines
        // have finished — reliably sequenced on the timeline, not a guessed delay.
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
    /* bottom-[35.77%] puts this box's bottom edge exactly on the hero
       painting's bottom edge (24% top + 1.25 aspect × 17.96% width, in photo
       coords) so the CTA below can bottom-align with the painting. */
    /* z-20 keeps the headline above the coverflow's blurred side cards at
       narrow widths; pointer-events-none lets clicks fall through the (mostly
       empty) box to the carousel chevrons underneath — only the CTA opts back
       in to the pointer. */
    <div
      ref={rootRef}
      className="pointer-events-none absolute start-[17%] end-[10%] top-[23%] bottom-[35.77%] z-20"
    >
      <h1 className="sr-only">{`${line1} ${line2}`}</h1>
      <div
        aria-hidden
        className="text-start font-display text-[clamp(1.7rem,5.4vw,6.5rem)] font-semibold leading-[1.05] text-ink"
        style={{ perspective: '800px' }}
      >
        <div className="hero-l1 invisible whitespace-nowrap">{line1}</div>
        <div className="hero-l2 invisible whitespace-nowrap">
          {line2}
          <span className="text-primary">.</span>
        </div>
      </div>
      {/* CTA — start-aligned, raised 20px off the container's bottom edge;
          faded in by the timeline above. */}
      <div className="hero-cta invisible pointer-events-auto absolute bottom-5 start-0">
        <GetStartedButton />
      </div>
    </div>
  );
}

/**
 * Landing — a scrolling page of full-width painted photos on a white field.
 * Both photos have pure-white (#fff) backgrounds, so the join is just a plain
 * 40px white gap.
 *
 *   navbar · landing-photo (headline in its white centre)
 *          · 40px white gap
 *          · secondary-photo
 *
 * (The original Home.tsx + the earlier shader backgrounds are still in the
 * repo, unused, until the new design is locked.)
 */
export default function HomeLanding() {
  // The '/' route loader fetches the homeMedia singleton (hero carousel
  // image set) plus the category list (focus-rail showcase) in one pass —
  // no client-side queries, no hardcoded URLs.
  const data = useLoaderData() as
    | { homeMedia?: HomeMedia | null; categories?: Category[] }
    | undefined;
  const heroImages = data?.homeMedia?.heroImages ?? [];
  const categories = data?.categories ?? [];
  // The "painter's world" scroll section lifts the navbar out during its video
  // beats, then eases it back in as the collections reveal.
  const [navHidden, setNavHidden] = useState(false);
  return (
    <div className="bg-white">
      <SEO path="/" description={null} />
      <Tabnavbar hidden={navHidden} />
      <section className="relative min-h-[45vh] overflow-hidden bg-white">
        <img
          src="/assets/landing-photo.jpg"
          alt=""
          className="block w-full select-none"
          draggable={false}
          // The hero photo is a work-in-progress; if it's missing, hide the
          // broken-image glyph and let the section hold on its min-height so
          // the page still renders cleanly.
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden';
          }}
        />
        <HeroHeadline />
        {heroImages.length > 0 && (
          /* Painting mirrors the headline's measured spacing from the painted
             frame: image top/bottom gaps = the text's top padding (~102px @1920),
             end gap = the text's start padding (~100px), and the image height
             fills the white centre minus those gaps (width follows the 4/5
             aspect). Values solved by pixel-scanning the frame strokes. */
          <div className="absolute end-[calc(19.05%_+_40px)] top-[24%] w-[17.96%]">
            <HeroArtworkCarousel images={heroImages} />
          </div>
        )}
      </section>

      {/* "Painter's World" — a pinned scroll-expansion: the video opens up
          from a 4:5 frame to full 16:9, then lifts away to reveal the
          collections rail below (placeholder media until painter_vid.mp4). */}
      <PainterWorldScroll
        videoSrc="/assets/painter-placeholder.mp4"
        posterSrc="/assets/painter-poster.jpg"
        line1="dive into the"
        line2="painter's world"
        onNavHiddenChange={setNavHidden}
      />

      {/* Collections showcase — the reveal the video lifts to uncover. */}
      <CategoryFocusRail categories={categories} />
    </div>
  );
}
