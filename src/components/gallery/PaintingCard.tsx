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
  // Prefer the preview-only image if the artist set one in Sanity;
  // fall back to the first detail image so existing paintings keep
  // working without re-uploading.
  const image = painting.previewImage ?? painting.images?.[0];
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
          className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-700 ease-gallery contrast-[1.06] saturate-[1.12] group-hover:scale-[1.04] group-hover:contrast-[1.1] group-hover:saturate-[1.22] group-hover:brightness-[1.04]"
        />
      )}

      {/* Glossy top-down sheen — a faint translucent highlight on the
          upper portion of the card. Catches the eye like light grazing
          a varnished canvas. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-paper/30 via-paper/5 to-transparent pointer-events-none mix-blend-overlay"
      />
      {/* Bottom-only scrim — kept short so the upper two-thirds of the
          painting render at full strength. Only enough to keep the title
          and category label legible against any image. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-paper/95 to-transparent pointer-events-none"
      />

      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1">
        {categoryTitle && (
          <span className="text-[10px] uppercase tracking-[0.176em] text-ink/55">
            {categoryTitle}
          </span>
        )}
        <span className="font-display text-xl text-ink group-hover:text-teal transition-colors duration-300">
          {title}
        </span>
        {isSold && (
          <span className="mt-1 inline-flex items-center text-[10px] uppercase tracking-[0.176em] text-deep">
            <span className="mr-2 h-1 w-1 rounded-full bg-deep" />
            Sold
          </span>
        )}
      </div>
    </Link>
  );
}
