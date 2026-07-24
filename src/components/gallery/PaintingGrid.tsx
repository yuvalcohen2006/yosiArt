import Reveal from '@/components/fx/Reveal';
import PaintingCard from './PaintingCard';
import type { Painting } from '@/sanity/types';

/**
 * The works wall — a plain, even grid.
 *
 * This used to be a CSS multi-column "magazine wall" cycling cards through
 * five different aspect ratios. Every card is the same 4:5 now: with mixed
 * ratios the paintings competed for attention purely by accident of position,
 * and no two captions in a row ever lined up. A regular grid lets the work
 * itself be the only thing that varies, and puts the titles on a shared
 * baseline.
 *
 * Stagger is capped at 8 so cards further down don't inherit absurd delays.
 */
export default function PaintingGrid({ paintings }: { paintings: Painting[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
      {paintings.map((p, i) => (
        <Reveal key={p._id} delay={(i % 8) * 0.05}>
          <PaintingCard painting={p} />
        </Reveal>
      ))}
    </div>
  );
}
