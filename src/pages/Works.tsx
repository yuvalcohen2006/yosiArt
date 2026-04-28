/**
 * Works listing placeholder. Filterable PaintingCard grid arrives in milestone 8.
 */
export default function Works() {
  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          The collection
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          Works
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/65 max-w-xl leading-relaxed">
          A grid of every painting, filterable by category. Coming online in
          milestone 8 — the page lights up once Sanity is wired in milestone 6.
        </p>
      </div>
    </section>
  );
}
