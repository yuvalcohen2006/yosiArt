import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import SEO from '@/components/seo/SEO';
import Tabnavbar from '@/components/ui/navbar';
import { useLocale } from '@/hooks/useLocale';
import { GetStartedButton } from '@/components/ui/get-started-button';
import { useLoaderData } from 'react-router-dom';
import HeroArtworkCarousel from '@/components/hero/HeroArtworkCarousel';
import type { HomeMedia } from '@/sanity/types';

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
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

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
    <div ref={rootRef} className="absolute start-[17%] end-[10%] top-[23%]">
      <h1 className="sr-only">{`${line1} ${line2}`}</h1>
      <div
        aria-hidden
        className="text-start font-display text-[clamp(2rem,6.2vw,7.5rem)] font-semibold leading-[1.05] text-ink"
        style={{ perspective: '800px' }}
      >
        <div className="hero-l1 invisible whitespace-nowrap">{line1}</div>
        <div className="hero-l2 invisible whitespace-nowrap">
          {line2}
          <span className="text-primary">.</span>
        </div>
      </div>
      {/* CTA — start-aligned under the lines; faded in by the timeline above. */}
      <div className="hero-cta invisible mt-8 flex justify-start">
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
  // The '/' route loader already fetches the homeMedia singleton; reuse its
  // hero-carousel image set (no new query, no hardcoded URLs).
  const data = useLoaderData() as { homeMedia?: HomeMedia | null } | undefined;
  const heroImages = data?.homeMedia?.heroImages ?? [];
  return (
    <div className="bg-white">
      <SEO path="/" description={null} />
      <Tabnavbar />
      <section className="relative overflow-hidden">
        <img
          src="/assets/landing-photo.jpg"
          alt=""
          className="block w-full select-none"
          draggable={false}
        />
        <HeroHeadline />
        {heroImages.length > 0 && (
          <div className="absolute end-[15%] top-[25%] w-[22%] max-w-[340px]">
            <HeroArtworkCarousel images={heroImages} />
          </div>
        )}
      </section>
      <div aria-hidden className="h-10 bg-white" />
      <section>
        <img
          src="/assets/secondary-photo.jpg"
          alt=""
          className="block w-full select-none"
          draggable={false}
        />
      </section>
    </div>
  );
}
