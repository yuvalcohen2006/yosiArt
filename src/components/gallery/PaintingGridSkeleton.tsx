/**
 * Placeholder tiles shown while `/works` (or a category) is fetching
 * its paintings from Sanity. Same grid + aspect ratio as
 * `PaintingGrid` / `PaintingCard`, so the page lays out at its final
 * size from the first paint — the cards just "fill in" once the data
 * arrives, no shuffle.
 */
export default function PaintingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="relative aspect-[4/5] overflow-hidden bg-mist/40 animate-pulse"
        />
      ))}
    </div>
  );
}
