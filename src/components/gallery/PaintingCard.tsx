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
  /** Aspect ratio of the image well — varies per card to build the
   *  asymmetric magazine wall. Defaults to the portrait 4:5. */
  aspectClass?: string;
};

/**
 * Single card in the works grid. The image sits in a variable-aspect well
 * (set by the grid) with a structured caption block beneath it — title,
 * category, and a "sold" marker — in the Swiss/editorial type system. While
 * the image loads a pulsing placeholder + spinner keeps the card from
 * looking empty. On hover the image scales gently and the title shifts to
 * the accent grey. The artwork stays in full colour — colour is the point.
 */
export default function PaintingCard({
  painting,
  aspectClass = 'aspect-[4/5]',
}: Props) {
  const { locale } = useLocale();
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

  return (
    <Link
      to={`/work/${painting.slug}`}
      className="group block"
      aria-label={title}
    >
      <div
        className={[
          'relative overflow-hidden bg-mist/40 border border-line transition-colors duration-500 group-hover:border-ink',
          aspectClass,
        ].join(' ')}
      >
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

      {/* Caption block — structured editorial label beneath the image. */}
      <div className="mt-3 flex flex-col gap-1 rtl:text-right">
        {categoryTitle && (
          <span className="eyebrow text-[10px]">{categoryTitle}</span>
        )}
        <span className="font-display font-semibold text-lg leading-snug text-ink group-hover:text-accent transition-colors duration-300">
          {title}
        </span>
        {isSold && (
          <span className="mt-0.5 inline-flex items-center gap-2 eyebrow text-[10px] text-deep">
            <span className="h-1 w-1 rounded-full bg-deep" />
            Sold
          </span>
        )}
      </div>
    </Link>
  );
}
