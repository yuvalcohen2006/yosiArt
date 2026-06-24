import { lazy, Suspense } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { useCategories } from '@/hooks/useCategories';
import { pickLocale } from '@/lib/pickLocale';
import { urlFor } from '@/sanity/imageUrl';
import Reveal from '@/components/fx/Reveal';
import AnimatedHeadline from '@/components/hero/AnimatedHeadline';
import CategoryCarousel from '@/components/home/CategoryCarousel';
import SEO from '@/components/seo/SEO';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import type { HomeMedia } from '@/sanity/types';

// Lazy-load the WebGL hero so three.js (~150KB) ships only with the landing
// route, not on every page. A plain dark panel stands in until it mounts.
const WebGLShader = lazy(() =>
  import('@/components/ui/web-gl-shader').then((m) => ({
    default: m.WebGLShader,
  })),
);

type HomeLoaderData = {
  homeMedia: HomeMedia | null;
};

const FALLBACK_CATEGORY_KEYS = [
  'originals',
  'exodus',
  'rabbis',
  'retro',
  'movies',
] as const;

/**
 * Re-innovated landing page. A full-viewport deep-sea hero: a WebGL "light
 * string" that travels as one ink stroke through the centre and disperses
 * into the deep-sea palette toward the edges, with the headline centred over
 * it. Below the dark hero, the page fades into the light editorial body with
 * the bodies-of-work carousel.
 *
 * The previous Home.tsx is kept in the repo (unused) until we lock the new
 * design at deployment.
 */
export default function HomeLanding() {
  const { t, locale } = useLocale();
  const categoriesState = useCategories();

  const loaderData = useLoaderData() as HomeLoaderData | undefined;
  const ogImageSrc = loaderData?.homeMedia?.ogImage ?? null;
  const homeOgImage = ogImageSrc
    ? urlFor(ogImageSrc).ignoreImageParams().auto('format').url()
    : undefined;

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
      <SEO path="/" description={null} image={homeOgImage} />

      {/* Hero — deep-sea WebGL light string with the headline centred. */}
      <section className="relative isolate flex min-h-[100lvh] items-center justify-center overflow-hidden bg-sea-900">
        <Suspense
          fallback={<div aria-hidden className="absolute inset-0 -z-10 bg-sea-900" />}
        >
          <WebGLShader className="absolute inset-0 -z-10 h-full w-full" />
        </Suspense>

        {/* Radial scrim — keeps the headline + CTA legible across their full
            width even over the bright core of the light string. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 90% 65% at 50% 50%, rgba(13,27,42,0.9) 0%, rgba(13,27,42,0.6) 55%, transparent 92%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center [text-shadow:_0_2px_24px_rgba(13,27,42,0.85)]">
          <p className="eyebrow mb-7 text-sea-100/80">{t('home.heroSubtitle')}</p>
          <h1 className="font-hero font-semibold tracking-tight leading-[1.05] text-sea-100 text-5xl sm:text-6xl lg:text-7xl">
            <AnimatedHeadline text={t('home.heroTitle')} />
          </h1>
          <div className="mt-12 flex justify-center">
            <LiquidButton
              size="xl"
              asChild
              className="rounded-full border border-sea-100/30 text-sea-100"
            >
              <Link to="/works">{t('home.viewWorks')}</Link>
            </LiquidButton>
          </div>
        </div>

        {/* Fade the dark hero into the light body below. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper"
        />
      </section>

      {/* Bodies of work — light editorial body. */}
      <section className="bg-paper px-6 md:px-12 lg:px-16 pt-16 pb-8">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="eyebrow mb-5">
              <span
                aria-hidden
                dir="ltr"
                className="text-accent [unicode-bidi:isolate]"
              >
                01 —{' '}
              </span>
              {t('nav.works')}
            </p>
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="font-display font-black text-5xl md:text-7xl tracking-tight leading-none">
                {t('home.bodiesOfWork')}
              </h2>
              <Link
                to="/works"
                className="font-display font-medium text-xs uppercase tracking-[0.2em] text-slate hover:text-accent transition-colors duration-300 whitespace-nowrap"
              >
                {t('home.seeAll')}{' '}
                <span aria-hidden className="inline-block rtl:rotate-180">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="-mx-6 md:-mx-12 lg:-mx-16">
          <Reveal>
            <CategoryCarousel cards={cards} viewWorksLabel={t('home.viewWorks')} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
