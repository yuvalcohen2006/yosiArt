import { useParams } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { usePaintings } from '@/hooks/usePaintings';
import { useCategories } from '@/hooks/useCategories';
import { pickLocale } from '@/lib/pickLocale';
import CategoryFilter from '@/components/gallery/CategoryFilter';
import PaintingGrid from '@/components/gallery/PaintingGrid';

export default function Category() {
  const { t, locale } = useLocale();
  const { category: categorySlug } = useParams<{ category: string }>();

  const paintingsState = usePaintings(categorySlug);
  const categoriesState = useCategories();

  const paintings =
    paintingsState.status === 'success' ? paintingsState.data : [];
  const currentCategory =
    categoriesState.status === 'success'
      ? categoriesState.data.find((c) => c.slug === categorySlug)
      : undefined;

  const title = currentCategory
    ? pickLocale(currentCategory.title, locale, categorySlug ?? '')
    : (categorySlug ?? '');

  return (
    <section className="px-6 md:px-12 lg:px-16 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          {t('category.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {title}
        </h1>
        <div className="hairline mt-12 mb-12" />

        <CategoryFilter />

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
