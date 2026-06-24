import { useLocale } from '@/hooks/useLocale';
import { usePaintings } from '@/hooks/usePaintings';
import CategoryFilter from '@/components/gallery/CategoryFilter';
import PaintingGrid from '@/components/gallery/PaintingGrid';
import PaintingGridSkeleton from '@/components/gallery/PaintingGridSkeleton';
import SEO from '@/components/seo/SEO';

export default function Works() {
  const { t } = useLocale();
  const state = usePaintings();
  const paintings = state.status === 'success' ? state.data : [];

  return (
    <section className="px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-20 md:pb-28">
      <SEO
        path="/works"
        title="Works"
        description="The full collection — every original acrylic painting in the catalogue, filterable by category."
      />
      {/* Header + filter — both centered to the narrower column so the
          filter strip ends up the same width as the hairline above it. */}
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">
          <span aria-hidden className="text-accent">— </span>
          {t('works.tagline')}
        </p>
        <h1 className="mt-6 font-display font-black text-6xl md:text-8xl tracking-tight leading-none">
          {t('works.title')}
        </h1>
        <div className="rule mt-12 mb-12" />
        <CategoryFilter />
      </div>

      {/* Painting grid — wider column so the asymmetric magazine wall has
          room for up to four cards across with comfortable margins. */}
      <div className="mx-auto max-w-7xl">
        {state.status === 'loading' ? (
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
