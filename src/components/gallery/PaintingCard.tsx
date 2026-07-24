import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
 * Single card in the works grid.
 *
 * The painting carries the card: the frame is a hairline with the barest
 * corner softening, and the only thing printed under it is the title in
 * quotes. The collection name is no longer a caption line — it drops in from
 * the top edge of the painting on hover, white over a dark wash, so a wall of
 * cards reads as paintings rather than as a table of labels.
 *
 * A sold piece says so on the painting itself, permanently, on a solid plate
 * so it stays legible over whatever colour sits underneath it.
 *
 * The link carries NO `aria-label`. aria-label overrides all descendant content
 * when the accessible name is computed, which would collapse the name to the
 * title alone and silently drop the collection and the sold marker — in a
 * screen reader's list of links, sold pieces would be indistinguishable from
 * available ones. The hover-revealed collection is only VISUALLY hidden
 * (opacity, never `hidden` or `aria-hidden`), so it stays in the name.
 */
export default function PaintingCard({ painting }: Props) {
  const { locale, t } = useLocale();
  const location = useLocation();
  const title = pickLocale(painting.title, locale, painting.slug);
  const categoryTitle = painting.category
    ? pickLocale(painting.category.title, locale)
    : '';
  // Prefer the preview-only image if the artist set one in Sanity; fall back to
  // the first detail image so existing paintings keep working.
  const image = painting.previewImage ?? painting.images?.[0];
  const isSold = painting.status === 'sold';

  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <Link
      to={`/work/${painting.slug}`}
      // Where the visitor is standing right now, handed to the painting page so
      // its back link can return them HERE — the unfiltered wall, a filtered
      // collection, or another painting — instead of guessing at the piece's
      // own collection. See PaintingDetail.
      state={{ from: `${location.pathname}${location.search}` }}
      className="group block"
    >
      <div
        className={[
          'relative aspect-[4/5] overflow-hidden rounded-[3px] border border-line bg-mist/40',
          'transition-[transform,box-shadow,border-color] duration-500 ease-gallery',
          'group-hover:-translate-y-1 group-hover:border-ink/70',
          'group-hover:shadow-[0_18px_38px_-24px_rgba(37,36,34,0.5)]',
          'group-focus-visible:-translate-y-1 group-focus-visible:border-ink/70',
          'motion-reduce:transition-none',
        ].join(' ')}
      >
        {/* Loading skeleton — a soft pulsing wash with a tiny spinner centred. */}
        <div
          aria-hidden
          className={[
            'absolute inset-0 flex items-center justify-center bg-mist/40 transition-opacity duration-500',
            loaded ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-pulse',
          ].join(' ')}
        >
          <Spinner className="h-5 w-5 text-ink/35" />
        </div>

        {image && (
          <img
            ref={imgRef}
            src={urlFor(image).width(800).height(1000).auto('format').url()}
            srcSet={[400, 800, 1200]
              .map(
                (w) =>
                  `${urlFor(image).width(w).height(Math.round(w * 1.25)).auto('format').url()} ${w}w`,
              )
              .join(', ')}
            sizes="(max-width: 768px) 50vw, 20vw"
            alt={pickAlt(image, locale, title)}
            loading="lazy"
            width={800}
            height={1000}
            draggable={false}
            onLoad={() => setLoaded(true)}
            className={[
              'absolute inset-0 h-full w-full object-cover',
              'transition-[transform,opacity] duration-700 ease-gallery',
              'group-hover:scale-[1.045] group-focus-visible:scale-[1.045]',
              loaded ? 'opacity-100' : 'opacity-0',
              'motion-reduce:transition-none',
            ].join(' ')}
          />
        )}

        {/* Collection — drops in from the top edge on hover / keyboard focus,
            white over a wash that fades out downward. `data-surface="dark"` is
            load-bearing, not decorative: it is what tells high-contrast mode
            this text sits on a dark fill (see scripts/auditContrast.mjs). */}
        {categoryTitle && (
          <div
            data-surface="dark"
            className={[
              'pointer-events-none absolute inset-x-0 top-0 flex justify-center px-3 pb-6 pt-3',
              'bg-gradient-to-b from-flame-900/75 via-flame-900/35 to-transparent',
              'opacity-0 transition-opacity duration-500 ease-gallery',
              'group-hover:opacity-100 group-focus-visible:opacity-100',
              'motion-reduce:transition-none',
            ].join(' ')}
          >
            <span
              className={[
                'font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-paper',
                '-translate-y-1.5 transition-transform duration-500 ease-gallery',
                'group-hover:translate-y-0 group-focus-visible:translate-y-0',
                'motion-reduce:transition-none',
              ].join(' ')}
            >
              {categoryTitle}
            </span>
          </div>
        )}

        {/* Sold — on the painting, always, on a solid plate. */}
        {isSold && (
          <span
            data-surface="dark"
            className="absolute bottom-0 start-0 m-2.5 rounded-[3px] bg-flame-900 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-paper"
          >
            {t('painting.statusSold')}
          </span>
        )}
      </div>

      {/* Caption — the piece's own title, in quotes, and nothing else. */}
      <p className="mt-2.5 text-start font-sans text-[15px] italic leading-snug text-ink transition-colors duration-300 group-hover:text-accent-ink">
        <span aria-hidden className="text-primary">&ldquo;</span>
        {title}
        <span aria-hidden className="text-primary">&rdquo;</span>
      </p>
    </Link>
  );
}
