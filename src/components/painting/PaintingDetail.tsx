import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { useUnit, formatDimensions } from '@/hooks/useUnit';
import { useDragScroll } from '@/hooks/useDragScroll';
import { pickLocale } from '@/lib/pickLocale';
import { pickAlt } from '@/lib/pickAlt';
import { urlFor } from '@/sanity/imageUrl';
import { useRelatedPaintings } from '@/hooks/usePainting';
import Reveal from '@/components/fx/Reveal';
import Spinner from '@/components/fx/Spinner';
import { getImageDims } from '@/lib/sanityImageMeta';
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
  const { unit, setUnit } = useUnit();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  // Grab-and-pull for the related strip; native scrolling handles everything
  // that is not a mouse.
  const relatedRail = useDragScroll<HTMLDivElement>();

  // Where the visitor actually came from, handed over in link state by
  // PaintingCard. This is the whole point of the back link: arriving from the
  // unfiltered wall, from a filtered collection, or from another painting all
  // used to dump you on the piece's OWN collection, which was frequently not
  // the screen you had just left.
  //
  // A direct hit — search result, shared link, refresh — carries no state, and
  // history.back() would leave the site entirely. Those fall back to the
  // piece's collection, which is the most useful gallery for a cold visitor.
  const location = useLocation();
  const cameFrom = (location.state as { from?: string } | null)?.from ?? null;
  const backTo =
    cameFrom ??
    (painting.category ? `/works?category=${painting.category.slug}` : '/works');

  // Trim the short display strings: CMS entries occasionally carry a stray
  // leading/trailing space, which is invisible on its own but pushes the title
  // off its flanking quotes and unbalances the spec chips. Description is left
  // as-is — it uses `whitespace-pre-line`, so its internal spacing is content.
  const title = pickLocale(painting.title, locale, painting.slug).trim();
  const description = pickLocale(painting.description, locale, '');
  const medium = pickLocale(painting.medium, locale, '').trim();
  const categoryTitle = painting.category
    ? pickLocale(painting.category.title, locale, painting.category.slug).trim()
    : '';

  const heroImage = painting.images?.[0];
  // Intrinsic dimensions parsed from the Sanity asset reference. Used
  // as <img width/height> attributes so the browser reserves the
  // correct aspect-ratio'd box before the image bytes arrive (no more
  // text jumping when the image lands).
  const heroDims = getImageDims(heroImage);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  useEffect(() => {
    if (heroImgRef.current?.complete) setHeroLoaded(true);
  }, []);
  // Canvas-vs-paper tag.
  const surfaceLabel = painting.surface
    ? t(
        painting.surface === 'canvas'
          ? 'painting.surfaceCanvas'
          : 'painting.surfacePaper',
      )
    : '';

  // The piece's characteristics, as label / value pairs. Size is deliberately
  // NOT in here — it is set large above this list, since after the painting
  // and its name it is the thing buyers ask about first.
  //
  // Built imperatively rather than with `.filter(Boolean)`: that does not
  // narrow `null` out of the element type, so the list would need a cast to
  // render.
  const specs: { label: string; value: string }[] = [];
  if (surfaceLabel) {
    specs.push({ label: t('painting.surface'), value: surfaceLabel });
  }
  if (painting.year) {
    specs.push({ label: t('painting.year'), value: String(painting.year) });
  }
  if (medium) {
    specs.push({ label: t('painting.medium'), value: medium });
  }

  // Dimensions — stored in cm, shown in the active unit via useUnit.
  const widthCm = painting.dimensions?.widthCm;
  const heightCm = painting.dimensions?.heightCm;
  const hasDimensions = widthCm != null && heightCm != null;

  const relatedState = useRelatedPaintings(
    painting.category?.slug,
    painting.slug,
  );
  const related =
    relatedState.status === 'success' ? relatedState.data : [];

  // SEO inputs — always English for the canonical metadata so search
  // engines and link-preview bots see one consistent copy per painting.
  const seoTitle = (painting.title?.en ?? painting.slug).trim();
  const seoCategory = painting.category?.title?.en ?? '';
  const seoDescription =
    painting.description?.en ??
    `${seoTitle}${seoCategory ? ` — ${seoCategory}` : ''}. Original acrylic painting by Yosi Cohen.`;
  const path = `/work/${painting.slug}`;
  // OG image — prefer the dedicated previewImage if set, else the first
  // detail image. Sized to OG's recommended 1200×630 with a focal-point
  // crop so the hotspot from the studio stays in frame.
  const ogSource = painting.previewImage ?? heroImage;
  // OG image — letterbox the same image we use for the gallery card
  // (the "banner you click to enter the painting") onto a 1200×630
  // black canvas. `ignoreImageParams()` disables Sanity's auto-applied
  // focal-point crop, which would otherwise silently turn `fit=fill`
  // back into `fit=crop` and chop the painting.
  const ogImage = ogSource
    ? urlFor(ogSource)
        .ignoreImageParams()
        .width(1200)
        .height(630)
        .fit('fill')
        .bg('000000')
        .auto('format')
        .url()
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
      <div className="mx-auto max-w-7xl">
        {/* Back link. It sits directly in the max-w-7xl column, so its arrow
            starts on exactly the same edge as the image below it and the
            related strip further down — no indent of its own. */}
        <div className="mb-10">
          <Link
            to={backTo}
            className="group -ms-1 inline-flex items-center gap-2.5 rounded-md px-1 py-1 font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate transition-colors duration-300 hover:text-accent-ink"
          >
            <ArrowLeft
              aria-hidden
              className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:-scale-x-100"
            />
            {/* Returning to a known screen just says "back"; a cold visitor
                being sent to the collection is told which one. */}
            <span>{cameFrom ? t('painting.back') : categoryTitle || t('works.title')}</span>
          </Link>
        </div>

        {/* Asymmetric two-column: image block on one side, structured
            meta / price / inquire column on the other. Stacks on mobile. */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Image column */}
        <div className="lg:col-span-7">
        {heroImage && (
          <div className="group block w-full">
            {/* Cue — sits above the painting, with a soft dark pill that
                fades in on hover. */}
            <div className="mb-3">
              <span
                aria-hidden
                className="inline-flex items-center font-display font-medium text-[11px] uppercase tracking-[0.2em] text-paper/0 bg-ink/0 group-hover:text-paper group-hover:bg-ink/50 backdrop-blur-sm px-3 py-1.5 transition-all duration-300"
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
              {/* Loading skeleton — sized to the image's actual aspect
                  ratio so the rest of the page (title, meta, price,
                  buttons) sits at its final position from the first
                  paint. Fades out as soon as the image is decoded. */}
              <div
                aria-hidden
                className={[
                  'absolute inset-0 flex items-center justify-center bg-mist/30 transition-opacity duration-500',
                  heroLoaded
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100 animate-pulse',
                ].join(' ')}
              >
                <Spinner className="h-8 w-8 text-ink/40" />
              </div>
              {/* srcSet so phones pull a smaller variant; the rendered size
                  doesn't change, the browser just downloads less data on small
                  viewports. Capped at 60vh — the preview stays modest since a
                  click opens the full-resolution lightbox. `sizes` reflects the
                  image column (~7/12 of the 1280px max) on desktop, 92vw on
                  mobile. */}
              <img
                ref={heroImgRef}
                src={urlFor(heroImage).width(1400).auto('format').url()}
                srcSet={[700, 1400, 2000]
                  .map(
                    (w) =>
                      `${urlFor(heroImage).width(w).auto('format').url()} ${w}w`,
                  )
                  .join(', ')}
                sizes="(max-width: 1024px) 92vw, 742px"
                alt={pickAlt(heroImage, locale, title)}
                width={heroDims?.width}
                height={heroDims?.height}
                // LCP candidate on the painting page — fetch ahead of
                // low-priority resources, decode off main thread.
                // React 18's runtime doesn't map camelCase `fetchPriority` to
                // the DOM attribute (React 19 does), so it logs a dev-only
                // "unknown prop" warning even though the attribute lands fine.
                // Pass the real lowercase attribute to keep the console clean;
                // cast because @types/react only types the camelCase form.
                {...({ fetchpriority: 'high' } as Record<string, string>)}
                decoding="async"
                onLoad={() => setHeroLoaded(true)}
                className={[
                  'block w-full max-h-[60vh] object-contain transition-opacity duration-500',
                  heroLoaded ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              />
            </motion.button>
          </div>
        )}
        </div>

        {/* Meta column — only mounted once the hero image has loaded, so
            the title, meta, price and inquire buttons all arrive in one
            moment with the image rather than shuffling as parts settle.
            The Reveal wrappers still play their fade-up on mount. */}
        {heroLoaded && (
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">{categoryTitle || t('painting.tagline')}</p>
            {/* Title sits at the previous page's collection-title scale, in the
                display serif's semibold, flanked by accent quotes. */}
            {/* Quotes kept tight to the title on one line — a newline between
                the spans and {title} makes JSX emit a stray space beside the
                opening mark. */}
            <h1 className="mt-4 font-display font-semibold text-4xl md:text-5xl tracking-tight leading-tight text-ink">
              <span aria-hidden className="text-primary">“</span>{title}<span aria-hidden className="text-primary">”</span>
            </h1>

            {/* Size, set large. After the painting and its name this is the
                thing people ask about first, so it is typeset as a headline in
                its own right rather than as one chip among several. The cm/in
                toggle rides alongside it on the baseline. */}
            {hasDimensions && (
              <div className="mt-8">
                <p className="eyebrow text-[11px]">{t('painting.dimensions')}</p>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-display text-3xl font-semibold leading-none tracking-tight text-ink md:text-4xl">
                    {formatDimensions(widthCm, heightCm, unit)}
                  </span>
                  <span
                    role="group"
                    aria-label={t('painting.unitLabel')}
                    className="inline-flex items-center font-sans text-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setUnit('cm')}
                      aria-pressed={unit === 'cm'}
                      aria-label={t('painting.unitCmAria')}
                      className={[
                        'transition-colors duration-300 hover:text-ink',
                        unit === 'cm' ? 'font-semibold text-ink' : 'text-slate',
                      ].join(' ')}
                    >
                      {t('painting.unitCm')}
                    </button>
                    <span aria-hidden className="mx-1.5 text-line">
                      /
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnit('in')}
                      aria-pressed={unit === 'in'}
                      aria-label={t('painting.unitInAria')}
                      className={[
                        'transition-colors duration-300 hover:text-ink',
                        unit === 'in' ? 'font-semibold text-ink' : 'text-slate',
                      ].join(' ')}
                    >
                      {t('painting.unitIn')}
                    </button>
                  </span>
                </div>
              </div>
            )}

            {/* The remaining characteristics, underneath the size, as ruled
                label/value rows. The old bordered chips gave surface, year and
                medium the same visual weight as each other AND as the size,
                and read as tags on a product rather than as a description of
                an object. */}
            {specs.length > 0 && (
              <dl className="mt-8 border-t border-line">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-2.5"
                  >
                    <dt className="eyebrow text-[11px]">{spec.label}</dt>
                    <dd className="text-end font-sans text-sm text-ink">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </Reveal>

          {description && (
            <Reveal delay={0.1}>
              <div className="rule mt-12" />
              <p className="mt-10 text-ink/80 text-lg leading-relaxed whitespace-pre-line">
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
        )}
        </div>

        {/* Related paintings strip — full width below the two-column
            block, also gated on heroLoaded so the entire below-hero
            region appears together. */}
        {heroLoaded && related.length > 0 && (
          <section className="mt-32">
            <Reveal>
              <div className="rule mb-8" />
              <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="font-display text-3xl font-black tracking-tight md:text-4xl">
                  {t('painting.related')}
                </h2>
                <span className="eyebrow text-[11px]">
                  {t('home.dragToExplore')}
                </span>
              </div>
            </Reveal>
            {/* A pulled strip rather than a grid: these are a sideline to the
                painting above, so they are sized down to roughly half a wall
                card and put on one line you drag through instead of a block
                that competes with the piece you came to see.
                `touch-pan-x` keeps vertical page scrolling working when a
                finger starts on the strip. */}
            <Reveal>
              <div
                ref={relatedRail.ref}
                {...relatedRail.handlers}
                className="-mx-1 cursor-grab touch-pan-x overflow-x-auto px-1 pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex w-max gap-4">
                  {related.map((p) => (
                    <div key={p._id} className="w-[150px] shrink-0 md:w-[168px]">
                      <PaintingCard painting={p} />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
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
