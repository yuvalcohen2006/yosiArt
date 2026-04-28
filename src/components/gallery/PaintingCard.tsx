import { Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { pickLocale } from '@/lib/pickLocale';
import { urlFor } from '@/sanity/imageUrl';
import type { Painting } from '@/sanity/types';

type Props = { painting: Painting };

/**
 * Single card in the works grid. Image fills a 4:5 portrait aspect
 * (works for most acrylic canvases). On hover the image scales gently
 * and the title shifts to teal. Links to the painting detail page.
 */
export default function PaintingCard({ painting }: Props) {
  const { locale } = useLocale();
  const title = pickLocale(painting.title, locale, painting.slug);
  const categoryTitle = painting.category
    ? pickLocale(painting.category.title, locale)
    : '';
  const image = painting.images?.[0];
  const isSold = painting.status === 'sold';

  return (
    <Link
      to={`/work/${painting.slug}`}
      className="group block relative overflow-hidden bg-mist/40 aspect-[4/5]"
      aria-label={title}
    >
      {image && (
        <img
          src={urlFor(image).width(800).height(1000).auto('format').url()}
          alt={image.alt ?? title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-gallery group-hover:scale-[1.04]"
        />
      )}

      {/* Soft bottom-up gradient so the title stays legible against any image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-paper/95 via-paper/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1">
        {categoryTitle && (
          <span className="text-[10px] uppercase tracking-[0.28em] text-ink/55">
            {categoryTitle}
          </span>
        )}
        <span className="font-display text-xl text-ink group-hover:text-teal transition-colors duration-300">
          {title}
        </span>
        {isSold && (
          <span className="mt-1 inline-flex items-center text-[10px] uppercase tracking-[0.28em] text-deep">
            <span className="mr-2 h-1 w-1 rounded-full bg-deep" />
            Sold
          </span>
        )}
      </div>
    </Link>
  );
}
