import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="px-6 md:px-10 py-32 md:py-40">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">404</p>
        <h1 className="mt-6 font-display text-6xl md:text-8xl tracking-tightest">
          <span className="italic font-light text-deep">Off</span> the canvas.
        </h1>
        <div className="hairline mx-auto mt-12 max-w-xs" />
        <p className="mt-10 text-ink/65">
          That page doesn&rsquo;t exist (yet).
        </p>
        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-ink hover:text-teal transition-colors duration-300"
        >
          <span aria-hidden className="block h-px w-12 bg-current" />
          <span>Back home</span>
        </Link>
      </div>
    </section>
  );
}
