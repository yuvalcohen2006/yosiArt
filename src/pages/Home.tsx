import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { useCategories } from '@/hooks/useCategories';
import { pickLocale } from '@/lib/pickLocale';
import { urlFor } from '@/sanity/imageUrl';
import Reveal from '@/components/fx/Reveal';
import Spinner from '@/components/fx/Spinner';
import HeroCarousel from '@/components/hero/HeroCarousel';
import AnimatedHeadline from '@/components/hero/AnimatedHeadline';
import SEO from '@/components/seo/SEO';
import type { HomeMedia, SanityImage } from '@/sanity/types';

type HomeLoaderData = {
  homeMedia: HomeMedia | null;
};

/**
 * One card in the categories teaser grid on the home page. Each card
 * tracks its own image-loaded state so the placeholder + spinner only
 * stay until that specific card's image arrives.
 */
type TeaserCard = {
  id: string;
  slug: string;
  label: string;
  coverImage: SanityImage | undefined;
};

function CategoryTeaserCard({
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
      className="group relative block aspect-[3/4] overflow-hidden bg-ink/10 border border-ink/10 transition-colors duration-500 hover:border-ink/30"
    >
      {/* Loading skeleton — paper-textured pulse + small light spinner.
          Fades out as soon as the cover image finishes loading. */}
      <div
        aria-hidden
        className={[
          'absolute inset-0 flex items-center justify-center bg-ink/20 transition-opacity duration-500',
          loaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse',
        ].join(' ')}
      >
        <Spinner className="h-6 w-6 text-paper/50" />
      </div>
      {card.coverImage && (
        <img
          ref={imgRef}
          src={urlFor(card.coverImage).width(600).height(800).auto('format').url()}
          alt=""
          loading="lazy"
          width={600}
          height={800}
          onLoad={() => setLoaded(true)}
          className={[
            'absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-700 ease-gallery group-hover:scale-[1.06] group-hover:brightness-105 group-hover:saturate-110',
            loaded ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      )}
      {/* Bottom-only scrim — keeps the label legible without
          muddying the upper two-thirds of the artwork. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />

      {/* Bottom row: label (with optional eyebrow on hover) + arrow */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
        <div className="transition-transform duration-500 ease-gallery group-hover:-translate-y-1.5">
          <span className="block text-[10px] uppercase tracking-[0.176em] text-paper/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mb-1">
            {viewWorksLabel}
          </span>
          <span className="font-display text-xl md:text-2xl text-paper">
            {card.label}
          </span>
        </div>
        <span
          aria-hidden
          className="inline-block text-paper text-2xl opacity-0 -translate-x-3 rtl:translate-x-3 rtl:rotate-180 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-gallery"
        >
          →
        </span>
      </div>
    </Link>
  );
}

const FALLBACK_CATEGORY_KEYS = [
  'originals',
  'exodus',
  'rabbis',
  'retro',
  'movies',
] as const;

export default function Home() {
  const { t, locale } = useLocale();
  const categoriesState = useCategories();

  // Build-time loader provides the homeMedia singleton (hero carousel
  // images + OG share image, both editable in Sanity). The OG image
  // is letterboxed onto a 1200x630 black canvas so shared site URLs
  // get the big-banner WhatsApp preview format regardless of the
  // uploaded image's aspect ratio.
  const loaderData = useLoaderData() as HomeLoaderData | undefined;
  const heroImages = loaderData?.homeMedia?.heroImages ?? [];
  const ogImageSrc = loaderData?.homeMedia?.ogImage ?? null;
  // The home OG image is hand-composed by the artist at exactly 1200×630
  // (white bar on the left, painting in the middle, black bar on the
  // right — whatever asymmetric framing they want). We serve it through
  // Sanity's CDN at native size with no transformation — `ignoreImageParams`
  // skips any auto-applied focal-point crop, and `auto('format')` lets
  // the CDN deliver WebP/AVIF to browsers that ask for it (link-preview
  // bots get the original JPEG/PNG via content negotiation).
  const homeOgImage = ogImageSrc
    ? urlFor(ogImageSrc).ignoreImageParams().auto('format').url()
    : undefined;

  // Parallax on the hero text — fades and lifts as you scroll past.
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 480], [1, 0.15]);
  const heroY = useTransform(scrollY, [0, 480], [0, -40]);
  // Scroll cue is loud only at the top of the page; once the visitor
  // starts scrolling, its job is done — fade it out.
  const cueOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Hero CTAs fade in after a 1.2s delay. Block pointer events until
  // the entrance animation finishes so the invisible links can't be
  // clicked through during the fade-up.
  const [ctaReady, setCtaReady] = useState(false);

  // Anchor the scroll cue to the hero title's geometry: vertically the
  // line spans the full height of both headline lines (plus a touch),
  // horizontally it sits at the midpoint of the gap between the title's
  // right edge and the screen's right edge.
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const [cueGeom, setCueGeom] = useState<{
    top: number;
    right: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const section = sectionRef.current;
      const title = titleRef.current;
      const l1 = line1Ref.current;
      const l2 = line2Ref.current;
      if (!section || !title || !l1 || !l2) return;
      const sectionRect = section.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const r1 = l1.getBoundingClientRect();
      const r2 = l2.getBoundingClientRect();
      const titleRight = Math.max(r1.right, r2.right);
      const screenW = window.innerWidth;
      const gap = screenW - titleRight;
      if (gap <= 0) {
        setCueGeom(null);
        return;
      }
      // Slightly taller than the title — "even a bit bigger".
      const height = titleRect.height * 1.08;
      setCueGeom({
        top: titleRect.top - sectionRect.top - (height - titleRect.height) / 2,
        right: gap / 2,
        height,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (titleRef.current) ro.observe(titleRef.current);
    if (sectionRef.current) ro.observe(sectionRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [locale]);

  const cards =
    categoriesState.status === 'success' && categoriesState.data.length > 0
      ? categoriesState.data.map((c) => ({
          id: c._id,
          slug: c.slug,
          label: pickLocale(c.title, locale, c.slug),
          coverImage: c.coverImage,
        }))
      : FALLBACK_CATEGORY_KEYS.map((slug) => ({
          id: slug,
          slug,
          label: t(`categories.${slug}`),
          coverImage: undefined,
        }));

  return (
    <>
      {/* Home OG card — image + title + URL only. We deliberately skip
          the description so WhatsApp's big-banner preview reads as a
          gallery cover (image dominant, terse title) rather than a
          marketing card with a paragraph of copy. */}
      <SEO path="/" description={null} image={homeOgImage} />
      {/* Hero — full-bleed, with the cycling images from
          `homeMedia.heroImages` cross-fading behind, and an animated
          headline up front. */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden min-h-[calc(100svh-72px)] flex items-center"
      >
        <HeroCarousel images={heroImages} className="absolute inset-0" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 mx-auto max-w-5xl w-full px-8 sm:px-10 md:px-12 lg:px-16"
        >
          <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
            {t('home.tagline')}
          </p>
          <h1
            ref={titleRef}
            className="mt-7 font-hero tracking-tight leading-[0.98] text-ink"
          >
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[8rem]">
              <span ref={line1Ref} className="inline-block">
                <AnimatedHeadline text={t('home.headline1')} />
              </span>
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] italic">
              <span ref={line2Ref} className="inline-block">
                <AnimatedHeadline
                  text={t('home.headline2')}
                  delay={0.45}
                  staggerPer={0.045}
                />
              </span>
            </span>
          </h1>
          <motion.div
            className={[
              'mt-12 flex items-center gap-6 flex-wrap',
              ctaReady ? '' : 'pointer-events-none',
            ].join(' ')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            onAnimationComplete={() => setCtaReady(true)}
          >
            <Link
              to="/works"
              className="text-sm uppercase tracking-[0.176em] text-ink hover:text-teal transition-colors duration-300"
            >
              {t('home.viewWorks')}
            </Link>
            <span aria-hidden className="block h-px w-12 bg-ink/45" />
            <Link
              to="/about"
              className="text-sm uppercase tracking-[0.176em] text-ink/55 hover:text-ink transition-colors duration-300"
            >
              {t('home.aboutTheArtist')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue — a clean thin track aligned vertically to the hero
            title (slightly taller than its two lines), centred horizontally
            in the empty band between the title's right edge and the screen
            edge. A black indicator slides down the track. Fades out as the
            visitor scrolls past the hero. */}
        {cueGeom && (
          <motion.div
            aria-hidden
            style={{
              opacity: cueOpacity,
              top: cueGeom.top,
              right: cueGeom.right,
              height: cueGeom.height,
            }}
            className="absolute z-10 hidden md:block pointer-events-none w-px bg-ink/25"
          >
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-px bg-ink"
              style={{ height: '32px' }}
              animate={{ top: ['-12%', '112%'], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 0.9,
                ease: [0.4, 0, 0.6, 1],
                times: [0, 0.15, 0.85, 1],
              }}
            />
          </motion.div>
        )}
      </section>

      {/* Categories teaser — fetched from Sanity, falls back to hardcoded
          keys until the dataset is populated. */}
      <section className="px-6 md:px-12 lg:px-16 pt-8 pb-8">
        <div className="mx-auto max-w-5xl">
          {/* Section break — visual transition out of the animated hero
              and into the editorial body of the page. */}
          <div className="hairline mb-24" />
          <Reveal>
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                {t('home.bodiesOfWork')}
              </h2>
              <Link
                to="/works"
                className="text-xs uppercase tracking-[0.176em] text-ink/55 hover:text-teal transition-colors duration-300"
              >
                {t('home.seeAll')}{' '}
                <span aria-hidden className="inline-block rtl:rotate-180">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
            {cards.map((card, i) => (
              <Reveal key={card.id} delay={i * 0.06}>
                <CategoryTeaserCard
                  card={card}
                  viewWorksLabel={t('home.viewWorks')}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
