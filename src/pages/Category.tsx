import { useParams } from 'react-router-dom';

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const title = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : '';

  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          Category
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {title}
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/65 max-w-xl leading-relaxed">
          The {title.toLowerCase()} collection will populate from Sanity in milestone 6.
        </p>
      </div>
    </section>
  );
}
