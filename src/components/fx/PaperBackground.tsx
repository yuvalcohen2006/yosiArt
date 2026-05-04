/**
 * Notebook-style background — one continuous sheet of paper covering the
 * entire viewport. The container is `fixed inset-0`, so the texture stays
 * locked to the viewport during scroll (no `background-attachment: fixed`
 * required, which avoids the iOS Safari jank that flag is famous for).
 *
 * `background-size: cover` makes a single image fill the viewport, so
 * there's never a tiling seam — the page reads as one unified sheet.
 *
 * Replace the texture file at `public/paper-texture.jpg`.
 */
export default function PaperBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
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
