import { Link } from 'react-router-dom';

/**
 * Hero placeholder. The real cinematic cross-fade carousel + animated
 * headline + featured-works strip arrive in milestone 7.
 * For now: a clean, full-bleed editorial hero that demonstrates the palette
 * and typography in their final shape.
 */
export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100svh-72px)] flex items-center px-6 md:px-10">
        <div className="mx-auto max-w-7xl w-full">
          <p className="text-[11px] uppercase tracking-[0.4em] text-teal">
            Acrylic on canvas
          </p>
          <h1 className="mt-8 font-display tracking-tightest leading-[0.95] text-ink">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[10rem]">
              Painted
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] italic font-light text-deep">
              with intent.
            </span>
          </h1>
          <div className="mt-12 flex items-center gap-8">
            <Link
              to="/works"
              className="group inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-ink hover:text-teal transition-colors duration-300"
            >
              <span>View works</span>
              <span
                aria-hidden
                className="inline-block h-px w-12 bg-ink group-hover:bg-teal group-hover:w-16 transition-all duration-300 ease-gallery"
              />
            </Link>
            <Link
              to="/about"
              className="text-sm uppercase tracking-[0.28em] text-ink/55 hover:text-ink transition-colors duration-300"
            >
              About the artist
            </Link>
          </div>
        </div>
      </section>

      {/* Categories teaser */}
      <section className="px-6 md:px-10 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-display text-3xl md:text-4xl tracking-tight">
              Bodies of work
            </h2>
            <Link
              to="/works"
              className="text-xs uppercase tracking-[0.28em] text-ink/55 hover:text-teal transition-colors duration-300"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {['Originals', 'Exodus', 'Rabbis', 'Retro', 'Movies'].map((c) => (
              <Link
                key={c}
                to={`/works/${c.toLowerCase()}`}
                className="group aspect-[3/4] relative overflow-hidden bg-mist/40 border border-mist hover:border-teal/40 transition-colors duration-300"
              >
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="font-display text-xl text-ink group-hover:text-teal transition-colors duration-300">
                    {c}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
