import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { pickLocale } from '@/lib/pickLocale';
import { urlFor } from '@/sanity/imageUrl';
import { useRelatedPaintings } from '@/hooks/usePainting';
import Reveal from '@/components/fx/Reveal';
import PaintingCard from '@/components/gallery/PaintingCard';
import PriceTag from './PriceTag';
import PaintingLightbox from './PaintingLightbox';
import type { Painting } from '@/sanity/types';

type Props = { painting: Painting };

/**
 * Single-column editorial layout — image first, then a centered narrow
 * column for title, meta, story, price, and the inquire-buttons slot
 * (filled in milestone 10). Below: a "more in this collection" strip.
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

  return (
    <article className="px-6 md:px-10 py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb back link */}
        <div className="mb-8">
          <Link
            to={painting.category ? `/works/${painting.category.slug}` : '/works'}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-ink/55 hover:text-teal transition-colors duration-300"
          >
            <span aria-hidden>←</span>
            <span>{categoryTitle || t('works.title')}</span>
          </Link>
        </div>

        {/* Hero image — click to open lightbox */}
        {heroImage && (
          <motion.button
            type="button"
            onClick={() => {
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative block w-full overflow-hidden bg-mist/40 cursor-zoom-in group"
            aria-label={t('painting.viewLarger')}
          >
            <img
              src={urlFor(heroImage).width(2000).auto('format').url()}
              alt={heroImage.alt ?? title}
              className="w-full h-auto"
            />
            {/* Faint corner watermark — deters casual right-click theft. */}
            <span
              aria-hidden
              className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 font-display italic text-paper/70 text-xl tracking-tight pointer-events-none"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.45)' }}
            >
              YosiArt
            </span>
            {/* "View larger" cue, fades in on hover */}
            <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-paper/0 group-hover:text-paper transition-colors duration-300 bg-ink/0 group-hover:bg-ink/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              {t('painting.viewLarger')}
            </span>
          </motion.button>
        )}

        {/* Body — narrower, centered */}
        <div className="mx-auto max-w-2xl mt-16 md:mt-20">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
              {categoryTitle || t('painting.tagline')}
            </p>
            <h1 className="mt-5 font-display text-5xl md:text-6xl tracking-tightest leading-[1.05]">
              {title}
            </h1>
            {meta.length > 0 && (
              <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-ink/55">
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

              {/* Inquire buttons placeholder — wired in milestone 10. */}
              {painting.status !== 'sold' && (
                <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                  <button
                    type="button"
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-mist text-xs uppercase tracking-[0.28em] text-ink/40 cursor-not-allowed"
                    title="Coming in milestone 10"
                  >
                    {t('painting.inquireWhatsapp')}
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-mist text-xs uppercase tracking-[0.28em] text-ink/40 cursor-not-allowed"
                    title="Coming in milestone 10"
                  >
                    {t('painting.inquireEmail')}
                  </button>
                </div>
              )}
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

      {/* Fullscreen lightbox — mounted but only opens on click */}
      <PaintingLightbox
        images={painting.images ?? []}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  );
}
