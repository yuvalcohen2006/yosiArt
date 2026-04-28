export default function Contact() {
  return (
    <section className="px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.32em] text-teal">
          Reach out
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          Contact
        </h1>
        <div className="hairline mt-12" />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/55">
              Email
            </p>
            <a
              href="mailto:hello@yosiart.example"
              className="mt-2 block font-display text-2xl text-ink hover:text-teal transition-colors duration-300"
            >
              hello@yosiart.example
            </a>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-ink/55">
              WhatsApp
            </p>
            <a
              href="https://wa.me/0000000000"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 block font-display text-2xl text-ink hover:text-teal transition-colors duration-300"
            >
              +000 0000 000
            </a>
          </div>
        </div>
        <p className="mt-12 text-ink/60 text-sm leading-relaxed max-w-prose">
          Real contact details slot in via Sanity once the CMS is online
          (milestone 5). Until then these are placeholders.
        </p>
      </div>
    </section>
  );
}
