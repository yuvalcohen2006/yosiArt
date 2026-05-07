import { useLocale } from '@/hooks/useLocale';
import { usePaintings } from '@/hooks/usePaintings';
import CategoryFilter from '@/components/gallery/CategoryFilter';
import PaintingGrid from '@/components/gallery/PaintingGrid';
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
        <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
          {t('works.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {t('works.title')}
        </h1>
        <div className="hairline mt-12 mb-12" />
        <CategoryFilter />
      </div>

      {/* Painting grid — wider column so we can fit four cards per row
          with comfortable margins on either side. */}
      <div className="mx-auto max-w-5xl">
        {state.status === 'loading' ? (
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
