import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { usePaintings } from '@/hooks/usePaintings';
import { useCategories } from '@/hooks/useCategories';
import { pickLocale } from '@/lib/pickLocale';
import WorksFilter, {
  DEFAULT_QUERY,
  isDefaultQuery,
  type WorksQuery,
} from '@/components/gallery/WorksFilter';
import PaintingGrid from '@/components/gallery/PaintingGrid';
import PaintingGridSkeleton from '@/components/gallery/PaintingGridSkeleton';
import SEO from '@/components/seo/SEO';
import type { Painting } from '@/sanity/types';

/** Lowest set price on a piece, or null if it carries none. Sorting has to
 *  cope with either currency being blank in Sanity. */
function priceOf(p: Painting): number | null {
  const values = [p.priceILS, p.priceUSD].filter(
    (v): v is number => typeof v === 'number',
  );
  return values.length ? Math.min(...values) : null;
}

/**
 * Works — the full catalogue.
 *
 * Introduced by the same section-header trio the collections rail uses
 * (.eyebrow / .section-title / .section-subtitle in index.css), centred over
 * the wall exactly as the rail's header is centred over its cards. The
 * headline follows the filter: pick a collection and it becomes that
 * collection's name, so the page always says what you are looking at.
 */
export default function Works() {
  const { t, locale } = useLocale();
  const state = usePaintings();
  const categoriesState = useCategories();
  const categories =
    categoriesState.status === 'success' ? categoriesState.data : [];

  // Collection links across the site point here as `/works?category=<slug>`
  // (this is the one catalogue page — the old per-category page was removed).
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  // Start from the default so the first client render matches the pre-rendered
  // /works HTML (which carries no query string) — a direct hit on
  // /works?category=x then can't mismatch the SSG output on hydration.
  const [query, setQuery] = useState<WorksQuery>(DEFAULT_QUERY);
  // Fold the ?category= param into the filter after mount, and keep it in step
  // when only the query string changes — e.g. clicking a different collection
  // while already on /works, which re-renders this page in place rather than
  // remounting it. Fires only when the param itself changes, so a manual pick
  // in the sidebar is never clobbered.
  useEffect(() => {
    const next = categoryParam ?? null;
    setQuery((q) => (q.category === next ? q : { ...q, category: next }));
  }, [categoryParam]);

  // Filtering and sorting run over the already-fetched set rather than going
  // back to Sanity: the catalogue is small, and this keeps switching
  // collections instant instead of a network round trip per click.
  //
  // The unwrapping happens INSIDE the memo on purpose: pulled out, the `[]`
  // fallback would be a fresh array on every render and the memo would rebuild
  // the whole list each time regardless of whether anything changed.
  const paintings = useMemo(() => {
    let list = state.status === 'success' ? state.data : [];
    if (query.category) {
      list = list.filter((p) => p.category?.slug === query.category);
    }
    if (query.availability === 'available') {
      list = list.filter((p) => p.status === 'available');
    }
    if (query.sort !== 'newest') {
      // Pieces without a price always sink to the bottom, in BOTH directions —
      // otherwise "cheapest first" would lead with everything unpriced.
      const dir = query.sort === 'priceAsc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const pa = priceOf(a);
        const pb = priceOf(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * dir;
      });
    }
    return list;
  }, [state, query]);

  // The headline names the current collection when one is picked.
  const activeCategory = query.category
    ? categories.find((c) => c.slug === query.category)
    : undefined;
  const heading = activeCategory
    ? pickLocale(activeCategory.title, locale)
    : t('works.title');
  const subtitle = activeCategory
    ? pickLocale(activeCategory.description, locale) || t('works.subtitle')
    : t('works.subtitle');

  return (
    <section className="px-6 pb-20 pt-12 md:px-12 md:pb-28 md:pt-16 lg:px-16">
      <SEO
        path="/works"
        title="Works"
        description="The full collection — every original acrylic painting in the catalogue, filterable by collection, price and availability."
      />

      {/* Section header — the shared trio, centred over the wall. */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-2">{t('works.tagline')}</p>
        <h1 className="section-title">{heading}</h1>
        <p className="section-subtitle mx-auto mt-3 max-w-md">{subtitle}</p>
      </header>

      {/* Filter sits to the side, above the wall — out of the header's way,
          and on the reading-start edge so it mirrors for Hebrew. The count
          takes the opposite end so narrowing always has visible feedback,
          including when it comes back empty. */}
      <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-3 md:mt-10">
        <WorksFilter categories={categories} value={query} onChange={setQuery} />
        {state.status === 'success' && (
          <p className="font-sans text-sm text-slate">
            {t('works.count', { count: paintings.length })}
          </p>
        )}
      </div>

      <div className="mx-auto mt-10 max-w-7xl md:mt-12">
        {state.status === 'loading' ? (
          <PaintingGridSkeleton />
        ) : paintings.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-sans text-slate">
              {isDefaultQuery(query) ? t('works.empty') : t('works.noMatches')}
            </p>
            {!isDefaultQuery(query) && (
              <button
                type="button"
                onClick={() => setQuery(DEFAULT_QUERY)}
                className="mt-4 font-sans text-sm font-bold uppercase tracking-[0.12em] text-accent-ink underline-offset-4 hover:underline"
              >
                {t('worksFilter.clear')}
              </button>
            )}
          </div>
        ) : (
          <PaintingGrid paintings={paintings} />
        )}
      </div>
    </section>
  );
}
