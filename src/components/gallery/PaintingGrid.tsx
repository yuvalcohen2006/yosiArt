import Reveal from '@/components/fx/Reveal';
import PaintingCard from './PaintingCard';
import type { Painting } from '@/sanity/types';

/**
 * Asymmetric "magazine wall" gallery. Cards flow through CSS multi-columns
 * (true masonry, no row-height gaps) and cycle through a few aspect ratios
 * so the wall reads as a curated hang rather than a rigid grid. The aspect
 * pattern is deterministic (keyed off index), so it's stable across renders
 * and mirrors cleanly in RTL — the columns follow the document direction.
 *
 * Stagger is capped at 8 so cards further down don't get absurd delays.
 */

// Deterministic aspect rhythm — a mix of standard portraits, a taller
// "feature" canvas, and the occasional square to break the grid.
const ASPECTS = [
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[4/6]', // taller feature
  'aspect-[1/1]', // square breather
  'aspect-[4/5]',
  'aspect-[3/4]',
] as const;

export default function PaintingGrid({ paintings }: { paintings: Painting[] }) {
  return (
    <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-5">
      {paintings.map((p, i) => (
        <div key={p._id} className="mb-4 md:mb-5 break-inside-avoid">
          <Reveal delay={(i % 8) * 0.05}>
            <PaintingCard
              painting={p}
              aspectClass={ASPECTS[i % ASPECTS.length]}
            />
          </Reveal>
        </div>
      ))}
    </div>
  );
}
