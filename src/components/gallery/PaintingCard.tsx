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
 * The painting carries the card: a hairline frame with the barest corner
 * softening, and the only thing printed under it is the title in quotes. The
 * collection is deliberately NOT shown here — a wall of cards should read as
 * paintings, not as a table of labels, and the piece names its collection on
 * its own page. It was briefly revealed on hover instead, which was worse
 * still: hover does not exist on a phone, so the label was simply missing for
 * most visitors.
 *
 * A sold piece says so on the painting itself, permanently, on a solid plate
 * so it stays legible over whatever colour sits underneath it.
 *
 * The link carries NO `aria-label`. aria-label overrides all descendant content
 * when the accessible name is computed, which would collapse the name to the
 * title alone and silently drop the sold marker — in a screen reader's list of
 * links, sold pieces would then be indistinguishable from available ones.
 */
export default function PaintingCard({ painting }: Props) {
  const { locale, t } = useLocale();
  const location = useLocation();
  const title = pickLocale(painting.title, locale, painting.slug);
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
      // An <a> is natively draggable. Inside the related strip that meant
      // pressing a card and pulling started the browser's own link-drag,
      // which fires pointercancel and kills the rail's drag-to-scroll — the
      // strip simply would not move. Nothing here is a drag source.
      draggable={false}
      className="group block select-none"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] border border-line bg-mist/40">
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
            // Tracks the wall's actual columns: 2 up to md, 3 through lg, 4
            // beyond. A stale hint here makes the browser pick the wrong
            // rendition and either blur the card or waste bandwidth.
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            alt={pickAlt(image, locale, title)}
            loading="lazy"
            width={800}
            height={1000}
            draggable={false}
            onLoad={() => setLoaded(true)}
            className={[
              'absolute inset-0 h-full w-full object-cover',
              'transition-transform duration-300 ease-out',
              'group-hover:scale-[1.02] group-focus-visible:scale-[1.02]',
              loaded ? 'opacity-100' : 'opacity-0',
              'motion-reduce:transition-none',
            ].join(' ')}
          />
        )}

        {/* Hover treatment — one accent frame, in and out in 300ms.
            An overlay border rather than a colour change on the container's own
            border: this keeps the frame at the image's exact radius and cannot
            nudge the layout by a pixel the way a border-width change would. */}
        <div
          aria-hidden
          className={[
            'pointer-events-none absolute inset-0 rounded-[3px] border-2 border-primary',
            'opacity-0 transition-opacity duration-300 ease-out',
            'group-hover:opacity-100 group-focus-visible:opacity-100',
            'motion-reduce:transition-none',
          ].join(' ')}
        />

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
      <p className="mt-3 text-start font-sans text-lg italic leading-snug text-ink transition-colors duration-300 group-hover:text-accent-ink md:text-xl">
        <span aria-hidden className="text-accent-ink">&ldquo;</span>
        {title}
        <span aria-hidden className="text-accent-ink">&rdquo;</span>
      </p>
    </Link>
  );
}
