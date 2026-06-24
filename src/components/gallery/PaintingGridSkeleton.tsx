/**
 * Placeholder tiles shown while `/works` (or a category) is fetching
 * its paintings from Sanity. Mirrors `PaintingGrid`'s multi-column
 * masonry + varied aspect ratios so the page lays out close to its
 * final shape from the first paint — the cards just "fill in" once the
 * data arrives.
 */
const ASPECTS = [
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[4/6]',
  'aspect-[1/1]',
  'aspect-[4/5]',
  'aspect-[3/4]',
];

export default function PaintingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="mb-4 md:mb-5 break-inside-avoid">
          <div
            className={[
              'relative overflow-hidden bg-mist/40 border border-line animate-pulse',
              ASPECTS[i % ASPECTS.length],
            ].join(' ')}
          />
          <div className="mt-3 h-3 w-1/2 bg-mist/40 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
