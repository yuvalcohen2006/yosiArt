import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { pickLocale } from '@/lib/pickLocale';
import { urlFor } from '@/sanity/imageUrl';
import { useRelatedPaintings } from '@/hooks/usePainting';
import Reveal from '@/components/fx/Reveal';
import PaintingCard from '@/components/gallery/PaintingCard';
import PriceTag from './PriceTag';
import InquireButtons from './InquireButtons';
import SEO, { SITE_BASE_URL, SITE_NAME } from '@/components/seo/SEO';
import type { Painting } from '@/sanity/types';

// The lightbox library (~70 KB gzipped including its zoom plugin) is only
// needed when the visitor actually clicks the painting — defer loading
// it as its own chunk so the initial page render stays snappy.
const PaintingLightbox = lazy(() => import('./PaintingLightbox'));

type Props = { painting: Painting };

/**
 * Single-column editorial layout — image first, then a centered narrow
 * column for title, meta, story, price, and the Inquire buttons row.
 * Below: a "more in this collection" strip.
 *
 * Click the hero image to open the fullscreen lightbox with pinch-zoom.
 */
export default function PaintingDetail({ painting }: Props) {
  const { t, locale } = useLocale();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const title = pickLocale(painting.title, locale, painting.slug);
  const description = pickLocale(painting.description, locale, '');
  const medium = pickLocale(painting.medium, locale, '');
  const categoryTitle = painting.category
    ? pickLocale(painting.category.title, locale, painting.category.slug)
    : '';

  const heroImage = painting.images?.[0];
  const meta = [
    painting.year ? String(painting.year) : null,
    medium || null,
    painting.dimensions?.widthCm && painting.dimensions?.heightCm
      ? `${painting.dimensions.widthCm} × ${painting.dimensions.heightCm} cm`
      : null,
  ].filter(Boolean) as string[];

  const relatedState = useRelatedPaintings(
    painting.category?.slug,
    painting.slug,
  );
  const related =
    relatedState.status === 'success' ? relatedState.data : [];

  // SEO inputs — always English for the canonical metadata so search
  // engines and link-preview bots see one consistent copy per painting.
  const seoTitle = painting.title?.en ?? painting.slug;
  const seoCategory = painting.category?.title?.en ?? '';
  const seoDescription =
    painting.description?.en ??
    `${seoTitle}${seoCategory ? ` — ${seoCategory}` : ''}. Original acrylic painting by Yosi Cohen.`;
  const path = `/work/${painting.slug}`;
  // OG image — prefer the dedicated previewImage if set, else the first
  // detail image. Sized to OG's recommended 1200×630 with a focal-point
  // crop so the hotspot from the studio stays in frame.
  const ogSource = painting.previewImage ?? heroImage;
  const ogImage = ogSource
    ? urlFor(ogSource).width(1200).height(630).fit('crop').auto('format').url()
    : undefined;

  // JSON-LD: tells Google "this page is a VisualArtwork" using
  // schema.org's vocabulary. Lets paintings show up cleanly in image
  // search and rich results.
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: seoTitle,
    creator: { '@type': 'Person', name: 'Yosi Cohen' },
    artMedium: painting.medium?.en ?? 'Acrylic on canvas',
    artworkSurface: 'Canvas',
    url: `${SITE_BASE_URL}${path}`,
    ...(painting.year ? { dateCreated: String(painting.year) } : {}),
    ...(painting.dimensions?.widthCm && painting.dimensions?.heightCm
      ? {
          width: { '@type': 'QuantitativeValue', value: painting.dimensions.widthCm, unitCode: 'CMT' },
          height: { '@type': 'QuantitativeValue', value: painting.dimensions.heightCm, unitCode: 'CMT' },
        }
      : {}),
    ...(ogImage ? { image: ogImage } : {}),
    ...(seoDescription ? { description: seoDescription } : {}),
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_BASE_URL },
  };

  return (
    <article className="px-6 md:px-12 lg:px-16 py-12 md:py-20">
      <SEO
        path={path}
        title={seoTitle}
        description={seoDescription}
        image={ogImage}
        type="article"
        jsonLd={jsonLd}
      />
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb back link */}
        <div className="mb-8">
          <Link
            to={painting.category ? `/works/${painting.category.slug}` : '/works'}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.176em] text-ink/55 hover:text-teal transition-colors duration-300"
          >
            <span aria-hidden className="inline-block rtl:rotate-180">
              ←
            </span>
            <span>{categoryTitle || t('works.title')}</span>
          </Link>
        </div>

        {/* Hero image + view-larger cue. The outer wrapper uses `w-fit`
            so it shrinks to the painting's actual rendered width — that
            way the cue above lines up with the painting's true left
            edge instead of the column's max-width edge. Hovering the
            wrapper fades the cue in. */}
        {heroImage && (
          <div className="group mx-auto block w-fit max-w-full">
            {/* Cue — sits above the painting at its top-left, with the
                soft dark pill that fades in on hover. */}
            <div className="mb-3">
              <span
                aria-hidden
                className="inline-flex items-center text-[11px] uppercase tracking-[0.176em] text-paper/0 bg-ink/0 group-hover:text-paper group-hover:bg-ink/40 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300"
              >
                {t('painting.viewLarger')}
              </span>
            </div>
            <motion.button
              type="button"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
              className="relative block overflow-hidden cursor-pointer"
              aria-label={t('painting.viewLarger')}
            >
              <img
                src={urlFor(heroImage).width(1400).auto('format').url()}
                alt={heroImage.alt ?? title}
                className="block w-auto max-w-full max-h-[70vh] object-contain"
              />
            </motion.button>
          </div>
        )}

        {/* Body — narrower column, left-aligned within. */}
        <div className="max-w-2xl mt-16 md:mt-20">
          <Reveal>
            <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
              {categoryTitle || t('painting.tagline')}
            </p>
            <h1 className="mt-5 font-display text-5xl md:text-6xl tracking-tightest leading-[1.05]">
              {title}
            </h1>
            {meta.length > 0 && (
              <p className="mt-6 text-[11px] uppercase tracking-[0.176em] text-ink/55">
                {meta.join(' · ')}
              </p>
            )}
          </Reveal>

          {description && (
            <Reveal delay={0.1}>
              <div className="hairline mt-12" />
              <p className="mt-10 text-ink/75 text-lg leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </Reveal>
          )}

          <Reveal delay={0.2}>
            <div className="mt-12 flex flex-col gap-6">
              <PriceTag
                priceILS={painting.priceILS}
                priceUSD={painting.priceUSD}
                status={painting.status}
              />

              <InquireButtons painting={painting} />
            </div>
          </Reveal>
        </div>

        {/* Related paintings strip */}
        {related.length > 0 && (
          <section className="mt-32">
            <Reveal>
              <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-10">
                {t('painting.related')}
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p, i) => (
                <Reveal key={p._id} delay={i * 0.06}>
                  <PaintingCard painting={p} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen lightbox — lazy-loaded, only mounted once the user
          opens it for the first time (Suspense fallback is null since
          the lightbox itself overlays the page). */}
      {lightboxOpen && (
        <Suspense fallback={null}>
          <PaintingLightbox
            images={painting.images ?? []}
            open={lightboxOpen}
            index={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        </Suspense>
      )}
    </article>
  );
}
