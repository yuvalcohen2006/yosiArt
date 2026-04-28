import { useLocale } from '@/hooks/useLocale';

/**
 * Works listing placeholder. Filterable PaintingCard grid arrives in milestone 8.
 */
export default function Works() {
  const { t } = useLocale();
  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          {t('works.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {t('works.title')}
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/65 max-w-xl leading-relaxed">
          {t('works.stub')}
        </p>
      </div>
    </section>
  );
}
