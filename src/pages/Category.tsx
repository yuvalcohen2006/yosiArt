import { useRef } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { usePaintings } from '@/hooks/usePaintings';
import { pickLocale } from '@/lib/pickLocale';
import CategoryFilter from '@/components/gallery/CategoryFilter';
import PaintingGrid from '@/components/gallery/PaintingGrid';
import PaintingGridSkeleton from '@/components/gallery/PaintingGridSkeleton';
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
  const liveCategory = loaderData?.current ?? null;

  // During the exit phase of an AnimatePresence transition, react-router
  // has already moved the matched route off this page — so `useLoaderData`
  // returns `undefined` mid-exit and the localised title would briefly
  // flash to the English slug fallback. Cache the last good category in
  // a ref so the visible title stays stable while this page fades out.
  const lastGoodCategoryRef = useRef<CategoryDoc | null>(null);
  if (liveCategory) lastGoodCategoryRef.current = liveCategory;
  const currentCategory = liveCategory ?? lastGoodCategoryRef.current;

  const paintingsState = usePaintings(categorySlug);
  const paintings =
    paintingsState.status === 'success' ? paintingsState.data : [];

  // Pretty fallback for the slug — used both when the loader hasn't
  // yet populated `currentCategory` (e.g. during navigation away) and
  // as the inner fallback for `pickLocale`. Splits on `-` and
  // capitalizes each word so "abstract-portraits" → "Abstract
  // Portraits", not the raw slug.
  const slugAsTitle = categorySlug
    ? categorySlug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
  const title = currentCategory
    ? pickLocale(currentCategory.title, locale, slugAsTitle)
    : slugAsTitle;

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
        <p className="eyebrow">
          <span aria-hidden className="text-accent">— </span>
          {t('category.tagline')}
        </p>
        <h1 className="mt-6 font-display font-black text-6xl md:text-8xl tracking-tight leading-none">
          {title}
        </h1>
        <div className="rule mt-12 mb-12" />
        <CategoryFilter />
      </div>

      {/* Painting grid — wider column so the asymmetric magazine wall has
          room for up to four cards across with comfortable margins. */}
      <div className="mx-auto max-w-7xl">
        {paintingsState.status === 'loading' ? (
          <PaintingGridSkeleton />
        ) : paintings.length === 0 ? (
          <div className="text-slate py-20">{t('works.empty')}</div>
        ) : (
          <PaintingGrid paintings={paintings} />
        )}
      </div>
    </section>
  );
}
