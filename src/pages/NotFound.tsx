import { Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import SEO from '@/components/seo/SEO';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <section className="px-6 md:px-12 lg:px-16 py-32 md:py-40">
      <SEO
        path="/404"
        title="Off the canvas"
        description="That page doesn't exist (yet)."
      />
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-[11px] text-accent">
          {t('notFound.tagline')}
        </p>
        <h1 className="mt-6 font-display text-6xl md:text-8xl tracking-tight leading-none">
          <span className="font-light text-slate">
            {t('notFound.title1')}
          </span>{' '}
          <span className="font-black">{t('notFound.title2')}</span>
        </h1>
        <div className="rule mt-12 max-w-xs" />
        <p className="mt-10 text-slate text-lg">{t('notFound.subtitle')}</p>
        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-3 font-display font-medium text-sm uppercase tracking-[0.2em] text-ink hover:text-accent transition-colors duration-300"
        >
          <span aria-hidden className="block h-px w-12 bg-current" />
          <span>{t('notFound.back')}</span>
        </Link>
      </div>
    </section>
  );
}
