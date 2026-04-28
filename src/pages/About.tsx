export default function About() {
  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          The artist
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          Yosi
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/70 max-w-prose leading-relaxed text-lg">
          A short bio goes here — a few sentences in Yosi&rsquo;s voice about
          the work, the practice, the studio. The real copy lives in Sanity
          and lands in milestone 11.
        </p>
      </div>
    </section>
  );
}
