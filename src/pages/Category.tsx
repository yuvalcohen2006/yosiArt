import { useParams } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';

const KNOWN: Record<string, string> = {
  originals: 'categories.originals',
  exodus: 'categories.exodus',
  rabbis: 'categories.rabbis',
  retro: 'categories.retro',
  movies: 'categories.movies',
};

export default function Category() {
  const { t } = useLocale();
  const { category } = useParams<{ category: string }>();
  const slug = category ?? '';
  const titleKey = KNOWN[slug];
  const title = titleKey ? t(titleKey) : slug;

  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          {t('category.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {title}
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/65 max-w-xl leading-relaxed">
          {t('category.stub', { category: title })}
        </p>
      </div>
    </section>
  );
}
