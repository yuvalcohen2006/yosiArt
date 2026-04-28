import { NavLink } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { useCategories } from '@/hooks/useCategories';
import { pickLocale } from '@/lib/pickLocale';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center text-[11px] uppercase tracking-[0.28em] px-4 py-2 rounded-full border transition-colors duration-300',
    isActive
      ? 'bg-ink text-paper border-ink'
      : 'border-mist text-ink/65 hover:border-teal hover:text-teal',
  ].join(' ');

/**
 * Sticky filter bar. "All" links to /works (exact match — won't stay
 * highlighted when a sub-category is active). Each category links to
 * /works/:slug and highlights when the URL matches.
 */
export default function CategoryFilter() {
  const { t, locale } = useLocale();
  const state = useCategories();
  const categories = state.status === 'success' ? state.data : [];

  return (
    <nav
      className="sticky top-[72px] z-20 -mx-6 md:-mx-10 px-6 md:px-10 py-4 mb-10 bg-paper/80 backdrop-blur-md border-b border-mist/60"
      aria-label="Categories"
    >
      <div className="flex flex-wrap items-center gap-2">
        <NavLink to="/works" end className={linkClass}>
          {t('works.all')}
        </NavLink>
        {categories.map((c) => (
          <NavLink
            key={c._id}
            to={`/works/${c.slug}`}
            className={linkClass}
          >
            {pickLocale(c.title, locale, c.slug)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
