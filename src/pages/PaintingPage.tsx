import { Link, useParams } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { usePainting } from '@/hooks/usePainting';
import PaintingDetail from '@/components/painting/PaintingDetail';

export default function PaintingPage() {
  const { t } = useLocale();
  const { slug } = useParams<{ slug: string }>();
  const state = usePainting(slug);

  if (state.status === 'loading') {
    return (
      <section className="px-6 md:px-10 py-32 text-center">
        <p className="text-ink/50 text-sm">{t('painting.loading')}</p>
      </section>
    );
  }

  if (state.status === 'error' || !state.data) {
    return (
      <section className="px-6 md:px-10 py-32 text-center">
        <p className="text-[11px] uppercase tracking-[0.176em] text-teal">404</p>
        <h1 className="mt-6 font-display text-4xl md:text-6xl tracking-tightest">
          {t('painting.notFound')}
        </h1>
        <Link
          to="/works"
          className="mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.176em] text-ink hover:text-teal transition-colors duration-300"
        >
          <span aria-hidden className="block h-px w-12 bg-current" />
          <span>{t('works.title')}</span>
        </Link>
      </section>
    );
  }

  return <PaintingDetail painting={state.data} />;
}
