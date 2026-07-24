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
        {/* Page header — the way out and the painting's name share one line, so
            the name is the first thing read and the back control sits beside it
            rather than floating above it.
            The title lives HERE, not in the meta column, for two reasons: it
            renders immediately instead of waiting on the hero image to decode,
            and it therefore lands in the prerendered HTML where search engines
            and link-preview bots can see it. */}
        <header className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-4 md:mb-12">
          <Link
            to={backTo}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-md border border-line px-4 font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate transition-colors duration-300 hover:border-ink/40 hover:text-accent-ink"
          >
            <ArrowLeft
              aria-hidden
              className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:-scale-x-100"
            />
            {/* Returning to a known screen just says "back"; a cold visitor
                being sent to the collection is told which one. */}
            <span>{cameFrom ? t('painting.back') : categoryTitle || t('works.title')}</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
            <span aria-hidden className="text-accent-ink">&ldquo;</span>
            {title}
            <span aria-hidden className="text-accent-ink">&rdquo;</span>
          </h1>
        </header>

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
            {/* Where the title used to sit: the collection this piece
                belongs to, named and linked so the wall it came from is one
                click away. */}
            <p className="font-sans text-base text-slate">
              {t('category.tagline')}
              {categoryTitle && painting.category ? (
                <>
                  {': '}
                  <Link
                    to={`/works?category=${painting.category.slug}`}
                    className="text-ink underline-offset-4 transition-colors duration-300 hover:text-accent-ink hover:underline"
                  >
                    {categoryTitle}
                  </Link>
                </>
              ) : null}
            </p>

            {/* Size, set large. After the painting and its name this is the
                thing people ask about first, so it is typeset as a headline in
                its own right rather than as one chip among several. The cm/in
                toggle rides alongside it on the baseline. */}
            {hasDimensions && (
              <div className="mt-8">
                <p className="eyebrow">{t('painting.dimensions')}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-display text-3xl font-semibold leading-none tracking-tight text-ink md:text-4xl">
                    {formatDimensions(widthCm, heightCm, unit)}
                  </span>
                  {/* A segmented control rather than two bare words with a
                      slash. The old version gave no hint that either half was
                      pressable — the active unit was just slightly bolder text.
                      A track, a filled active segment and real button targets
                      make it read as a switch on sight. */}
                  <span
                    role="group"
                    aria-label={t('painting.unitLabel')}
                    className="inline-flex items-center rounded-md border border-line bg-mist/30 p-0.5 font-sans text-sm"
                  >
                    {(['cm', 'in'] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        aria-pressed={unit === u}
                        aria-label={t(u === 'cm' ? 'painting.unitCmAria' : 'painting.unitInAria')}
                        // The active segment is a dark fill carrying light
                        // text, so it must declare itself to high-contrast
                        // mode (scripts/auditContrast.mjs).
                        data-surface={unit === u ? 'dark' : undefined}
                        className={[
                          // min-h-10 + the track's padding clears the 44px
                          // touch-target minimum for the control as a whole.
                          'inline-flex min-h-10 items-center rounded-[4px] px-3.5 transition-colors duration-200 motion-reduce:transition-none',
                          unit === u
                            ? 'bg-ink font-semibold text-paper'
                            : 'text-slate hover:text-ink',
                        ].join(' ')}
                      >
                        {t(u === 'cm' ? 'painting.unitCm' : 'painting.unitIn')}
                      </button>
                    ))}
                  </span>
                </div>
              </div>
            )}

            {/* The remaining characteristics, underneath the size, as ruled
                label/value rows. The old bordered chips gave surface, year and
                medium the same visual weight as each other AND as the size,
                and read as tags on a product rather than as a description of
                an object. */}
            {/* `divide-y` rather than a border on each row: it draws a line
                BETWEEN rows only, so the list closes on its last value instead
                of trailing a stray rule into the whitespace under it. */}
            {specs.length > 0 && (
              <dl className="mt-8 divide-y divide-line border-t border-line">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-6 py-3"
                  >
                    <dt className="eyebrow">{spec.label}</dt>
                    <dd className="text-end font-sans text-base text-ink">
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
                {/* Only advertise dragging when there is somewhere to drag to. */}
                {relatedRail.scrollable && (
                  <span className="eyebrow text-[11px]">
                    {t('home.dragToExplore')}
                  </span>
                )}
              </div>
            </Reveal>
            {/* A pulled strip rather than a grid: these are a sideline to the
                painting above, so they sit on one line you drag through rather
                than in a block that competes with the piece you came to see.
                Still comfortably browsable, though — at the previous ~150px
                these were too small to read as paintings.
                `touch-pan-x` keeps vertical page scrolling working when a
                finger starts on the strip. The grab cursor is conditional: a
                collection with only a few pieces does not overflow, and
                offering a grab that cannot move reads as a broken control. */}
            <Reveal>
              <div
                ref={relatedRail.ref}
                {...relatedRail.handlers}
                className={[
                  '-mx-1 touch-pan-x overflow-x-auto px-1 pb-2',
                  '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                  relatedRail.scrollable ? 'cursor-grab active:cursor-grabbing' : '',
                ].join(' ')}
              >
                <div className="flex w-max gap-5">
                  {related.map((p) => (
                    <div key={p._id} className="w-[210px] shrink-0 md:w-[240px]">
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
