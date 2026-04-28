import { useLocale } from '@/hooks/useLocale';

export default function About() {
  const { t } = useLocale();
  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          {t('about.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {t('about.title')}
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/70 max-w-prose leading-relaxed text-lg">
          {t('about.stub')}
        </p>
      </div>
    </section>
  );
}
