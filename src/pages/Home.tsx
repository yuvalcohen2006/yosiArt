import { Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import Reveal from '@/components/fx/Reveal';

const CATEGORY_KEYS = [
  'originals',
  'exodus',
  'rabbis',
  'retro',
  'movies',
] as const;

/**
 * Hero placeholder. The real cinematic cross-fade carousel + animated
 * headline + featured-works strip arrive in milestone 7.
 * For now: a clean, full-bleed editorial hero that demonstrates the palette
 * and typography in their final shape, plus a scroll-revealed categories
 * teaser to demo the Reveal wrapper.
 */
export default function Home() {
  const { t } = useLocale();
  return (
    <>
      {/* Hero — above the fold, no Reveal wrapper needed. */}
      <section className="relative min-h-[calc(100svh-72px)] flex items-center px-6 md:px-10">
        <div className="mx-auto max-w-7xl w-full">
          <p className="text-[11px] uppercase tracking-[0.4em] text-teal">
            {t('home.tagline')}
          </p>
          <h1 className="mt-8 font-display tracking-tightest leading-[0.95] text-ink">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[10rem]">
              {t('home.headline1')}
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] italic font-light text-deep">
              {t('home.headline2')}
            </span>
          </h1>
          <div className="mt-12 flex items-center gap-8 flex-wrap">
            <Link
              to="/works"
              className="group inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-ink hover:text-teal transition-colors duration-300"
            >
              <span>{t('home.viewWorks')}</span>
              <span
                aria-hidden
                className="inline-block h-px w-12 bg-ink group-hover:bg-teal group-hover:w-16 transition-all duration-300 ease-gallery"
              />
            </Link>
            <Link
              to="/about"
              className="text-sm uppercase tracking-[0.28em] text-ink/55 hover:text-ink transition-colors duration-300"
            >
              {t('home.aboutTheArtist')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories teaser — arrives via scroll reveal with stagger. */}
      <section className="px-6 md:px-10 py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                {t('home.bodiesOfWork')}
              </h2>
              <Link
                to="/works"
                className="text-xs uppercase tracking-[0.28em] text-ink/55 hover:text-teal transition-colors duration-300"
              >
                {t('home.seeAll')} →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {CATEGORY_KEYS.map((slug, i) => (
              <Reveal key={slug} delay={i * 0.06}>
                <Link
                  to={`/works/${slug}`}
                  className="group aspect-[3/4] relative overflow-hidden bg-mist/40 border border-mist hover:border-teal/40 transition-colors duration-300 block"
                >
                  <div className="absolute inset-0 flex items-end p-4">
                    <span className="font-display text-xl text-ink group-hover:text-teal transition-colors duration-300">
                      {t(`categories.${slug}`)}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
