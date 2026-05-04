import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';
import { useCategories } from '@/hooks/useCategories';
import { pickLocale } from '@/lib/pickLocale';
import { urlFor } from '@/sanity/imageUrl';
import Reveal from '@/components/fx/Reveal';
import HeroCarousel from '@/components/hero/HeroCarousel';
import AnimatedHeadline from '@/components/hero/AnimatedHeadline';

const FALLBACK_CATEGORY_KEYS = [
  'originals',
  'exodus',
  'rabbis',
  'retro',
  'movies',
] as const;

export default function Home() {
  const { t, locale } = useLocale();
  const categoriesState = useCategories();

  // Parallax on the hero text — fades and lifts as you scroll past.
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 480], [1, 0.15]);
  const heroY = useTransform(scrollY, [0, 480], [0, -40]);

  const cards =
    categoriesState.status === 'success' && categoriesState.data.length > 0
      ? categoriesState.data.map((c) => ({
          id: c._id,
          slug: c.slug,
          label: pickLocale(c.title, locale, c.slug),
          coverImage: c.coverImage,
        }))
      : FALLBACK_CATEGORY_KEYS.map((slug) => ({
          id: slug,
          slug,
          label: t(`categories.${slug}`),
          coverImage: undefined,
        }));

  return (
    <>
      {/* Hero — full-bleed, with cross-fading featured paintings behind
          and an animated headline up front. */}
      <section className="relative overflow-hidden min-h-[calc(100svh-72px)] flex items-center">
        <HeroCarousel className="absolute inset-0" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 mx-auto max-w-5xl w-full px-6 md:px-12 lg:px-16"
        >
          <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
            {t('home.tagline')}
          </p>
          <h1 className="mt-7 font-hero tracking-tight leading-[0.98] text-ink">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[8rem]">
              <AnimatedHeadline text={t('home.headline1')} />
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] italic">
              <AnimatedHeadline
                text={t('home.headline2')}
                delay={0.45}
                staggerPer={0.045}
              />
            </span>
          </h1>
          <motion.div
            className="mt-12 flex items-center gap-6 flex-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Link
              to="/works"
              className="text-sm uppercase tracking-[0.176em] text-ink hover:text-teal transition-colors duration-300"
            >
              {t('home.viewWorks')}
            </Link>
            <span aria-hidden className="block h-px w-12 bg-ink/45" />
            <Link
              to="/about"
              className="text-sm uppercase tracking-[0.176em] text-ink/55 hover:text-ink transition-colors duration-300"
            >
              {t('home.aboutTheArtist')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            delay: 1.6,
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="h-10 w-px bg-ink/40 mx-auto" />
        </motion.div>
      </section>

      {/* Categories teaser — fetched from Sanity, falls back to hardcoded
          keys until the dataset is populated. */}
      <section className="px-6 md:px-12 lg:px-16 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                {t('home.bodiesOfWork')}
              </h2>
              <Link
                to="/works"
                className="text-xs uppercase tracking-[0.176em] text-ink/55 hover:text-teal transition-colors duration-300"
              >
                {t('home.seeAll')} →
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
            {cards.map((card, i) => (
              <Reveal key={card.id} delay={i * 0.06}>
                <Link
                  to={`/works/${card.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-ink/10 border border-ink/10 transition-colors duration-500 hover:border-ink/30"
                >
                  {card.coverImage && (
                    <img
                      src={urlFor(card.coverImage)
                        .width(600)
                        .height(800)
                        .auto('format')
                        .url()}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-gallery group-hover:scale-[1.06]"
                    />
                  )}
                  {/* Persistent dark gradient — keeps title legible against any image. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent" />
                  {/* Hover wash — deepens the whole card */}
                  <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25" />

                  {/* Bottom row: label (with optional eyebrow on hover) + arrow */}
                  <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3">
                    <div className="transition-transform duration-500 ease-gallery group-hover:-translate-y-1.5">
                      <span className="block text-[10px] uppercase tracking-[0.176em] text-paper/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mb-1">
                        {t('home.viewWorks')}
                      </span>
                      <span className="font-display text-xl md:text-2xl text-paper">
                        {card.label}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className="text-paper text-2xl opacity-0 -translate-x-3 rtl:translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-gallery"
                    >
                      →
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
