import { useLoaderData, useParams } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { usePaintings } from '@/hooks/usePaintings';
import { pickLocale } from '@/lib/pickLocale';
import CategoryFilter from '@/components/gallery/CategoryFilter';
import PaintingGrid from '@/components/gallery/PaintingGrid';
import SEO from '@/components/seo/SEO';
import type { Category as CategoryDoc } from '@/sanity/types';

type LoaderData = {
  current: CategoryDoc | null;
};

export default function Category() {
  const { t, locale } = useLocale();
  const { category: categorySlug } = useParams<{ category: string }>();
  // Build-time loader hands the matched category in directly so the SEO
  // block has the title before render. We default to `null` if the
  // loader hasn't run yet (e.g. dev-mode HMR replacing the component
  // without re-registering the route's loader).
  const loaderData = useLoaderData() as LoaderData | undefined;
  const currentCategory = loaderData?.current ?? null;

  const paintingsState = usePaintings(categorySlug);
  const paintings =
    paintingsState.status === 'success' ? paintingsState.data : [];

  const title = currentCategory
    ? pickLocale(currentCategory.title, locale, categorySlug ?? '')
    : (categorySlug ?? '');

  // For SEO we always emit the English category title in the metadata —
  // the canonical URL is locale-agnostic, and crawlers index against
  // English. Visitors get the localized title swapped in client-side.
  const englishTitle = currentCategory?.title?.en ?? title;

  return (
    <section className="px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-20 md:pb-28">
      <SEO
        path={`/works/${categorySlug ?? ''}`}
        title={englishTitle ? `${englishTitle} — Works` : 'Works'}
        description={`Acrylic paintings in the ${englishTitle} collection by Yosi Cohen.`}
      />
      {/* Header + filter — both centered to the narrower column so the
          filter strip ends up the same width as the hairline above it. */}
      <div className="mx-auto max-w-3xl">
        <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
          {t('category.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {title}
        </h1>
        <div className="hairline mt-12 mb-12" />
        <CategoryFilter />
      </div>

      {/* Painting grid — wider column so we can fit four cards per row
          with comfortable margins on either side. */}
      <div className="mx-auto max-w-5xl">
        {paintingsState.status === 'loading' ? (
          <div className="text-ink/50 py-20">{t('works.loading')}</div>
        ) : paintings.length === 0 ? (
          <div className="text-ink/50 py-20">{t('works.empty')}</div>
        ) : (
          <PaintingGrid paintings={paintings} />
        )}
      </div>
    </section>
  );
}
