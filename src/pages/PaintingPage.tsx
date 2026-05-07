import { Link, useLoaderData } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import PaintingDetail from '@/components/painting/PaintingDetail';
import SEO from '@/components/seo/SEO';
import type { Painting } from '@/sanity/types';

/**
 * The painting detail page. Data comes from the route's `loader` (see
 * `src/routes.tsx`) so the painting is already in hand at build time —
 * the pre-rendered HTML carries the painting-specific title, OG image,
 * and JSON-LD that link-preview bots and crawlers need.
 */
export default function PaintingPage() {
  const painting = (useLoaderData() as Painting | null | undefined) ?? null;
  const { t } = useLocale();

  if (!painting) {
    return (
      <section className="px-6 md:px-10 py-32 text-center">
        <SEO
          path="/work"
          title="Painting not found"
          description="The painting you're looking for isn't here."
        />
        <p className="text-[11px] uppercase tracking-[0.176em] text-teal">
          404
        </p>
        <h1 className="mt-6 font-display text-4xl md:text-6xl tracking-tightest">
          {t('painting.notFound')}
        </h1>
        <Link
          to="/works"
          className="mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.176em] text-ink hover:text-teal transition-colors duration-300"
        >
          <span aria-hidden className="block h-px w-12 bg-current" />
          <span>{t('works.title')}</span>
        </Link>
      </section>
    );
  }

  return <PaintingDetail painting={painting} />;
}
