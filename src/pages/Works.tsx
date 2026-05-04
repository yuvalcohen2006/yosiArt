import { useLocale } from '@/hooks/useLocale';
import { usePaintings } from '@/hooks/usePaintings';
import CategoryFilter from '@/components/gallery/CategoryFilter';
import PaintingGrid from '@/components/gallery/PaintingGrid';

export default function Works() {
  const { t } = useLocale();
  const state = usePaintings();
  const paintings = state.status === 'success' ? state.data : [];

  return (
    <section className="px-6 md:px-12 lg:px-16 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          {t('works.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {t('works.title')}
        </h1>
        <div className="hairline mt-12 mb-12" />

        <CategoryFilter />

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
