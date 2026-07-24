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
 * Single card in the works grid. The image sits in a 4:5 well with a caption
 * below. On hover, the category slides down from the top over a black gradient.
 * Sold status appears as a tag at the bottom-right of the image with a dark
 * backing layer. The title is flanked by quotes.
 */
export default function PaintingCard({ painting }: Props) {
  const { locale, t } = useLocale();
  const title = pickLocale(painting.title, locale, painting.slug);
  const categoryTitle = painting.category
    ? pickLocale(painting.category.title, locale)
    : '';
  const image = painting.previewImage ?? painting.images?.[0];
  const isSold = painting.status === 'sold';

  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <Link to={`/work/${painting.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-mist/40 transition-colors duration-500 group-hover:border-ink">
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
              'absolute inset-0 h-full w-full object-cover transition-[transform,filter,opacity] duration-500 ease-gallery',
              'group-hover:scale-[1.02]',
              loaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />
        )}

        {/* Category overlay — fades in from top on hover with black gradient */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 via-black/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {categoryTitle && (
          <span
            aria-hidden
            className="absolute top-3 left-0 right-0 text-center text-white text-sm font-medium translate-y-2 opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100"
          >
            {categoryTitle}
          </span>
        )}

        {/* Sold tag at bottom-right with dark comfort layer */}
        {isSold && (
          <div className="absolute bottom-0 right-0 p-3">
            <div className="absolute inset-0 bg-black/60 rounded-sm" />
            <span className="relative inline-flex items-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-[0.08em]">
              {t('painting.statusSold')}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex flex-col gap-0.5 text-start">
        <span className="font-sans text-sm italic leading-snug text-ink transition-colors duration-300 group-hover:text-accent-ink">
          <span aria-hidden className="text-primary">"</span>{title}<span aria-hidden className="text-primary">"</span>
        </span>
      </div>
    </Link>
  );
}
