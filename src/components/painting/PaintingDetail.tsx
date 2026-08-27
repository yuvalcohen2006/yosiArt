import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ZoomIn } from 'lucide-react';
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
import SegmentedToggle from '@/components/ui/SegmentedToggle';
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
  // Aspect ratio of the hero, when the asset ref carries its dimensions. Used
  // to size the image's box up front — see the wrapper below — so the box is
  // right before the bytes land and the `sizes` hint can describe it honestly.
  const heroRatio =
    heroDims && heroDims.height > 0 ? heroDims.width / heroDims.height : null;
  const heroImgRef = useRef<HTMLImageElement>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);
  useEffect(() => {
    if (heroImgRef.current?.complete) setHeroLoaded(true);
  }, []);

  // Warm the lightbox chunk before it is needed. `lazy()` only starts the
  // download on the click that opens it, so the visitor paid ~70KB of latency
  // while staring at the painting they just clicked. Vite resolves this to the
  // same chunk as the `lazy()` import above, and a second `import()` of an
  // already-loaded module is a no-op, so this is safe to call repeatedly.
  const preloadLightbox = useCallback(() => {
    void import('./PaintingLightbox');
  }, []);

  // Belt and braces: if they never hover (touch, keyboard), fetch it once the
  // browser is idle anyway, so the first tap is still instant.
  useEffect(() => {
    if (!heroLoaded) return;
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(preloadLightbox);
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(preloadLightbox, 1500);
    return () => window.clearTimeout(id);
  }, [heroLoaded, preloadLightbox]);
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
        {/* Page header — just the way out.
            The collection this piece belongs to used to sit up here too, on the
            far side of the same row. It reads better directly above the
            painting's name, where the two lines form one caption block, so it
            has moved down into the meta column and this row carries the single
            control it started as. */}
        <header className="mb-10 md:mb-12">
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
        </header>

        {/* Asymmetric two-column: image block on one side, structured
            meta / price / inquire column on the other. Stacks on mobile. */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Image column */}
        <div className="lg:col-span-7">
        {/* Shrink-wrapped to the artwork and centred, rather than a full-width
            block. A tall painting cannot fill the column: `max-h-[60vh]`
            clamps its height, and because the intrinsic ratio is known the
            used WIDTH shrinks with it — so the image box was narrower than
            the column and sat against its start edge. Two things went wrong
            there: the price strip below centres on the column and so drifted
            off the painting it belongs to, and the enlarge cue, anchored to
            the column's end, floated in the empty gutter beside the work.
            Hugging the image fixes both by construction. */}
        {heroImage && (
          // Width is stated explicitly rather than shrink-wrapped. `w-fit` made
          // the box depend on the image having an intrinsic size, so before the
          // bytes arrived it collapsed to zero — measured 0x0 — and the
          // `inset-0` skeleton and spinner had no area to render in, replacing
          // a reserved placeholder with a blank column and a hard snap on load.
          // `min(100%, 60vh * ratio)` is the same value the CSS would have
          // settled on, computed up front, so the box is correct from the first
          // paint and the enlarge cue and the price below both line up with the
          // artwork rather than the column. Falls back to full width when the
          // asset ref carries no dimensions.
          <div
            className={[
              'group mx-auto block max-w-full',
              heroRatio ? '' : 'w-full',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              heroRatio
                ? { width: `min(100%, calc(60vh * ${heroRatio.toFixed(4)}))` }
                : undefined
            }
          >
            <motion.button
              type="button"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              onPointerEnter={preloadLightbox}
              onFocus={preloadLightbox}
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
                // Must describe the box above, not the column: `sizes` is
                // resolved by the preload scanner from this expression alone,
                // never from layout, so a flat 742px made the browser pick a
                // 1400w file for a ~450px slot on the page's LCP element.
                sizes={
                  heroRatio
                    ? `(max-width: 1024px) 92vw, min(742px, calc(60vh * ${heroRatio.toFixed(4)}))`
                    : '(max-width: 1024px) 92vw, 742px'
                }
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
                // Everything below the image — title, specs, price, Inquire,
                // related — is gated on `heroLoaded`, and `load` never fires
                // for an image that 404s or fails to decode. Without this the
                // page would sit on a back link and a pulsing skeleton forever
                // on any CDN hiccup; treating a failure as "done" degrades to a
                // page that is merely missing its picture.
                onError={() => setHeroLoaded(true)}
                className={[
                  // Fills the explicitly-sized wrapper above, which already
                  // carries the intrinsic ratio, so there is nothing left to
                  // letterbox.
                  'block h-auto w-full transition-opacity duration-500',
                  heroLoaded ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              />

              {/* Enlarge cue — ON the painting, and legible without hovering.
                  It used to sit above the image and was fully transparent until
                  hover, which meant it took up a line of layout while saying
                  nothing, and on a touch screen (no hover) it never appeared at
                  all — so the single most useful thing you can do here was
                  invisible to half the visitors. */}
              {heroLoaded && (
                <span
                  aria-hidden
                  data-surface="dark"
                  className="pointer-events-none absolute bottom-3 end-3 inline-flex items-center gap-2 rounded-md bg-flame-900/75 px-3 py-2 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-paper opacity-85 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                >
                  <ZoomIn aria-hidden className="h-4 w-4" />
                  {t('painting.viewLarger')}
                </span>
              )}
            </motion.button>
          </div>
        )}

        {/* The ask, directly under the work it prices and centred on it. It
            used to sit in the meta column paired with the Inquire buttons,
            which put the price halfway down a column of specifications; under
            the painting it is the first thing the eye reaches after the piece
            itself, which is the order a buyer actually reads in.

            Gated on `heroLoaded` like the meta column, so the whole
            below-the-image region still arrives in one moment rather than
            assembling in pieces. */}
        {heroLoaded && (
          <Reveal delay={0.2}>
            <div className="mt-8 flex justify-center">
              <PriceTag
                priceILS={painting.priceILS}
                priceUSD={painting.priceUSD}
                status={painting.status}
                accentHex={painting.accentHex}
              />
            </div>
          </Reveal>
        )}

        </div>

        {/* Meta column — only mounted once the hero image has loaded, so
            the title, meta, price and inquire buttons all arrive in one
            moment with the image rather than shuffling as parts settle.
            The Reveal wrappers still play their fade-up on mount. */}
        {heroLoaded && (
        <div className="lg:col-span-5">
          <Reveal>
            {/* The body of work this piece belongs to, sitting directly on top
                of the piece's own name and ruled off from it. Read together the
                two lines are one caption — "this collection, this painting" —
                which is why the divider is a hairline in the same `line` token
                as the spec rules rather than anything heavier: it separates the
                two without breaking them into unrelated blocks.

                No colon. The quotes around the collection do the same work a
                colon did, and they answer the quotes around the title below, so
                the pair reads as one typographic idea. They sit OUTSIDE the
                link so hovering underlines the name alone. */}
            {categoryTitle && painting.category ? (
              <div className="mb-6">
                <p className="font-display text-xl font-semibold leading-tight tracking-tight text-slate sm:text-2xl">
                  {t('category.tagline')}{' '}
                  {/* Quotes match the ones flanking the title below: same
                      accent colour, and `aria-hidden` on both so a screen
                      reader with punctuation verbosity on does not announce one
                      pair and skip the other. No `whitespace-nowrap` — the
                      glyphs sit flush against the name with no break
                      opportunity between them anyway, whereas holding the whole
                      CMS-authored title unbreakable would push a long
                      collection name past the viewport edge. */}
                  <span aria-hidden className="text-accent-ink">&ldquo;</span>
                  <Link
                    to={`/works?category=${painting.category.slug}`}
                    className="text-ink underline-offset-4 transition-colors duration-300 hover:text-accent-ink hover:underline"
                  >
                    {categoryTitle}
                  </Link>
                  <span aria-hidden className="text-accent-ink">&rdquo;</span>
                </p>
                <div aria-hidden className="mt-6 h-px w-full bg-line" />
              </div>
            ) : null}

            {/* The piece's own name, alongside the work rather than up in the
                page header — the collection took that slot.

                Set big: this is the loudest type on the page, and it should be,
                because after the painting itself the name is what the visitor
                came to read. `leading-[1.05]` rather than `leading-tight` so a
                title that wraps to two lines still reads as one block instead
                of two stacked sentences, and `text-balance` splits those lines
                evenly rather than leaving one orphaned word on the second. */}
            <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              <span aria-hidden className="text-accent-ink">&ldquo;</span>
              {title}
              <span aria-hidden className="text-accent-ink">&rdquo;</span>
            </h1>

            {/* Size, set large. After the painting and its name this is the
                thing people ask about first, so it is typeset as a headline in
                its own right rather than as one chip among several. The cm/in
                toggle rides alongside it on the baseline. */}
            {hasDimensions && (
              // Extra air below the oversized title on desktop only. The h1
              // scales to ~60px but every gap under it was a flat 32px, so the
              // loudest element got the least proportional breathing room; +8px
              // here re-asserts the title as the dominant block. Mobile's
              // smaller text-4xl title keeps its 32px.
              <div className="mt-8 lg:mt-10">
                <p className="eyebrow">{t('painting.dimensions')}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="font-display text-3xl font-semibold leading-none tracking-tight text-ink md:text-4xl">
                    {formatDimensions(widthCm, heightCm, unit)}
                  </span>
                  {/* A segmented control rather than two bare words with a
                      slash. The old version gave no hint that either half was
                      pressable — the active unit was just slightly bolder text.
                      Shares its shape with the currency switch by the price. */}
                  <SegmentedToggle
                    value={unit}
                    onChange={setUnit}
                    groupLabel={t('painting.unitLabel')}
                    options={[
                      {
                        value: 'cm',
                        label: t('painting.unitCm'),
                        ariaLabel: t('painting.unitCmAria'),
                      },
                      {
                        value: 'in',
                        label: t('painting.unitIn'),
                        ariaLabel: t('painting.unitInAria'),
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* The remaining characteristics, underneath the size, as ruled
                label/value rows. The old bordered chips gave surface, year and
                medium the same visual weight as each other AND as the size,
                and read as tags on a product rather than as a description of
                an object. */}
            {/* `divide-y` for the inner rules, plus `border-y` so the block is
                closed top and bottom. The closing rule belongs to THIS list and
                sits tight under its last value — it used to float in the gap
                above the description, reading as though it belonged to neither. */}
            {specs.length > 0 && (
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-6 py-3 lg:py-3.5"
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
              {/* No rule of its own — the specs list above now closes itself. */}
              <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink/80">
                {description}
              </p>
            </Reveal>
          )}

          {/* The ask, closing the column. With the price now under the painting
              this is no longer half of a two-up row, so it simply follows the
              story on the same start edge as the paragraph above it — the lead
              -in line and the description share a left margin and read as one
              continuous thought ending in "here is how to reach him". */}
          <Reveal delay={0.2}>
            <div className="mt-10">
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
          // 128px here stacked with the section's own `rule` + heading margins
          // put ~200px of dead space above "More in this collection". 96px on
          // desktop keeps a clear section break without the void; mobile keeps
          // its 128px, where the single column needs the harder separation.
          <section className="mt-32 lg:mt-24">
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
              <div className="relative">
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

                {/* Soft edges, so the strip reads as continuing past the frame
                    rather than being chopped off at it. Gradient direction is
                    mirrored for Hebrew; `start`/`end` position them, but
                    Tailwind does not flip the gradient axis itself.

                    Each edge fades in ONLY once there is something behind it.
                    Both used to show for the whole life of any overflowing row,
                    so at rest — where the row always starts — a band of white
                    sat permanently across the first painting, washing out the
                    artwork to advertise content that was not there. A fade is a
                    promise that the row continues; it has to be told when that
                    is actually true.

                    `to-paper/0` rather than `to-transparent`: the transparent
                    keyword is transparent BLACK, so browsers that still
                    interpolate gradients un-premultiplied drag the ramp through
                    grey and the fade reads as a dirty smudge instead of as the
                    page. Fading white to zero-alpha WHITE has no such midpoint
                    anywhere. */}
                {relatedRail.scrollable && (
                  <>
                    <div
                      aria-hidden
                      className={[
                        'pointer-events-none absolute inset-y-0 start-0 w-10',
                        'bg-gradient-to-r from-paper via-paper/80 to-paper/0 rtl:bg-gradient-to-l',
                        'transition-opacity duration-300 motion-reduce:transition-none',
                        relatedRail.atStart ? 'opacity-0' : 'opacity-100',
                      ].join(' ')}
                    />
                    <div
                      aria-hidden
                      className={[
                        'pointer-events-none absolute inset-y-0 end-0 w-10',
                        'bg-gradient-to-l from-paper via-paper/80 to-paper/0 rtl:bg-gradient-to-r',
                        'transition-opacity duration-300 motion-reduce:transition-none',
                        relatedRail.atEnd ? 'opacity-0' : 'opacity-100',
                      ].join(' ')}
                    />
                  </>
                )}
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
