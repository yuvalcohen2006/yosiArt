import { useParams } from 'react-router-dom';

export default function PaintingPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">Painting</p>
        <h1 className="mt-6 font-display text-4xl md:text-6xl tracking-tightest">
          {slug ?? 'untitled'}
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/65 max-w-xl leading-relaxed">
          The painting detail layout — lightbox, dimensions, story, inquire
          buttons — is built in milestones 9 and 10.
        </p>
      </div>
    </section>
  );
}
