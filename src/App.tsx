/*
  Milestone 1 — bare scaffold, updated palette + fonts.
  Demonstrates the editorial palette (paper / ink / mist / teal / deep) and
  the Cormorant Garamond + DM Sans pairing.
  Layout shell, routing, and motion arrive in later milestones.
*/
export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <section className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.32em] text-teal">
          YosiArt — work in progress
        </p>
        <h1 className="mt-7 font-display text-6xl md:text-8xl tracking-tightest leading-[1.02] text-ink">
          Acrylic <em className="font-light italic text-deep">on</em> canvas.
        </h1>
        <div className="hairline mt-12" />
        <p className="mt-10 text-ink/70 max-w-md leading-relaxed">
          The site is being built milestone-by-milestone. Theme palette and
          typography are now in place — next up is the routing shell, then
          motion and the immersive front.
        </p>
      </section>
    </main>
  );
}
