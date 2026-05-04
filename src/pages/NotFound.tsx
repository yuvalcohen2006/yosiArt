import { Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <section className="px-6 md:px-12 lg:px-16 py-32 md:py-40">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          {t('notFound.tagline')}
        </p>
        <h1 className="mt-6 font-display text-6xl md:text-8xl tracking-tightest leading-[1.05]">
          <span className="italic font-light text-ink/70">
            {t('notFound.title1')}
          </span>{' '}
          {t('notFound.title2')}
        </h1>
        <div className="hairline mt-12 max-w-xs" />
        <p className="mt-10 text-ink/65 text-lg">{t('notFound.subtitle')}</p>
        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-ink hover:text-teal transition-colors duration-300"
        >
          <span aria-hidden className="block h-px w-12 bg-current" />
          <span>{t('notFound.back')}</span>
        </Link>
      </div>
    </section>
  );
}
