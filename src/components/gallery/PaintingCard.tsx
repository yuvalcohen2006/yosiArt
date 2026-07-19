import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { pickLocale } from '@/lib/pickLocale';
import { pickAlt } from '@/lib/pickAlt';
import { urlFor } from '@/sanity/imageUrl';
import Spinner from '@/components/fx/Spinner';
import type { Painting } from '@/sanity/types';

type Props = {
  painting: Painting;
};

/**
 * Single card in the works grid. The image sits in a variable-aspect well
 * (set by the grid) with a structured caption block beneath it — title,
 * category, and a "sold" marker — in the Swiss/editorial type system. While
 * the image loads a pulsing placeholder + spinner keeps the card from
 * looking empty. On hover the image scales gently and the title shifts to
 * the accent grey. The artwork stays in full colour — colour is the point.
 */
export default function PaintingCard({ painting }: Props) {
  const { locale, t } = useLocale();
  const title = pickLocale(painting.title, locale, painting.slug);
  const categoryTitle = painting.category
    ? pickLocale(painting.category.title, locale)
    : '';
  // Prefer the preview-only image if the artist set one in Sanity;
  // fall back to the first detail image so existing paintings keep
  // working without re-uploading.
  const image = painting.previewImage ?? painting.images?.[0];
  const isSold = painting.status === 'sold';

  // Track image load state so the placeholder can fade out once the
  // bytes arrive. Handle the cached / SSR case via the `complete` flag
  // — onLoad doesn't fire if the image was already loaded before React
  // attached its handler.
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  // The link deliberately carries NO `aria-label`. It used to be
  // `aria-label={title}`, and aria-label overrides all descendant content when
  // the accessible name is computed — so the name collapsed to the title alone
  // and silently dropped the category and the "sold" marker rendered below. In
  // a screen reader's list of links, sold pieces were indistinguishable from
  // available ones. The link already contains visible text, so letting the name
  // be computed from its contents is both correct and strictly more useful.
  return (
    <Link to={`/work/${painting.slug}`} className="group block">
      {/* Every well is the same 4:5 — the wall is a regular grid now, so the
          paintings differ and nothing else does. */}
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-mist/40 transition-colors duration-500 group-hover:border-ink">
        {/* Loading skeleton — a soft pulsing wash with a tiny spinner
            centred. Fades out as soon as the image is ready. */}
        <div
          aria-hidden
          className={[
            'absolute inset-0 flex items-center justify-center bg-mist/40 transition-opacity duration-500',
            loaded
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 animate-pulse',
          ].join(' ')}
        >
          <Spinner className="h-5 w-5 text-ink/35" />
        </div>

        {image && (
          <img
            ref={imgRef}
            // Three resolution variants — phones at low DPR pull the
            // 400w version (~25 KB), tablets / mid-DPR phones get 800w,
            // hi-DPR / desktop hover-zoom gets 1200w.
            src={urlFor(image).width(800).height(1000).auto('format').url()}
            srcSet={[400, 800, 1200]
              .map(
                (w) =>
                  `${urlFor(image).width(w).height(Math.round(w * 1.25)).auto('format').url()} ${w}w`,
              )
              .join(', ')}
            sizes="(max-width: 768px) 50vw, 25vw"
            alt={pickAlt(image, locale, title)}
            loading="lazy"
            width={800}
            height={1000}
            onLoad={() => setLoaded(true)}
            className={[
              'absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-700 ease-gallery',
              'group-hover:scale-[1.03] group-hover:brightness-[1.03]',
              loaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />
        )}
      </div>

      {/* Caption — the collection name in the site's kicker style (the same
          `.eyebrow` that sets "The collections"), with the piece's own title
          beneath it in italic Assistant. */}
      <div className="mt-3 flex flex-col gap-1 text-start">
        {/* Sized deliberately 2px under the title beneath it (16 vs 18), so
            the pair reads as a label and its subject rather than two
            competing lines. */}
        {categoryTitle && (
          <span className="eyebrow text-base">{categoryTitle}</span>
        )}
        <span className="font-sans text-lg italic leading-snug text-ink transition-colors duration-300 group-hover:text-accent-ink">
          {title}
        </span>
        {isSold && (
          <span className="eyebrow mt-0.5 inline-flex items-center gap-2 text-[10px] text-slate">
            <span className="h-1 w-1 rounded-full bg-slate" />
            {t('painting.statusSold')}
          </span>
        )}
      </div>
    </Link>
  );
}
