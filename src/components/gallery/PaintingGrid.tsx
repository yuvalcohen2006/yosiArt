import Reveal from '@/components/fx/Reveal';
import PaintingCard from './PaintingCard';
import type { Painting } from '@/sanity/types';

/**
 * Grid of paintings with a staggered reveal. Stagger is capped at 8 so
 * cards further down the page don't have absurd 2-second delays — they
 * still trigger when scrolled into view, just snappier.
 */
export default function PaintingGrid({ paintings }: { paintings: Painting[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {paintings.map((p, i) => (
        <Reveal key={p._id} delay={(i % 8) * 0.05}>
          <PaintingCard painting={p} />
        </Reveal>
      ))}
    </div>
  );
}
