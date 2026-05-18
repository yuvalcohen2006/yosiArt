/**
 * Notebook-style background — one continuous sheet of paper behind the
 * whole site.
 *
 * The container is `position: fixed`, anchored to the top, and sized to
 * `100lvh` (large viewport height — the viewport at its tallest, with
 * the mobile address bar hidden). Sizing to the *largest* possible
 * viewport rather than `inset-0` means it can never leave an uncovered
 * white strip at the bottom when a fast scroll collapses the address
 * bar faster than a viewport-tracking element can repaint. When the bar
 * is showing, the sheet simply overflows below the fold — harmless.
 *
 * `background-size: cover` keeps the texture filling the sheet at its
 * own aspect ratio (no stretch, no tiling seam). `fixed` keeps it from
 * moving on scroll without `background-attachment: fixed`, which is
 * famous for iOS Safari jank.
 *
 * Replace the texture file at `public/paper-texture.jpg`.
 */
export default function PaperBackground() {
  return (
    <div
      className="fixed inset-x-0 top-0 h-[100lvh] -z-10 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {/* The single, unified paper sheet. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/paper-texture.jpg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Soft inner-vignette for a touch of depth — keeps edges from
          looking flat under bright screens. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(53,53,53,0.06) 100%)',
        }}
      />
    </div>
  );
}
