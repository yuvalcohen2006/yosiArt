import { cn } from '@/lib/utils';

/**
 * The site's one primary-button language, shared by the hero CTA and the
 * collection rail's "Explore" so they read as the same control in two places
 * (they do different jobs — one dives into the collections, the other opens a
 * specific gallery — but they should look identical).
 *
 * Every measurement is em-based off the font-size, so CTA_SIZE is the single
 * dial for both. Keep them in sync by importing, not by copying values.
 */
const CTA_SIZES = {
  /** The hero CTA — scaled to sit under the display headline. */
  lg: 'text-[clamp(1.1rem,1.25vw,1.35rem)] px-[3.62em] py-[0.72em] border-[3px]',
  /** Inline companion size. The explicit h-14 is the point: it matches the
   *  rail's stepper pill exactly (which is h-14 for the same reason), so the
   *  pair line up to the pixel instead of drifting whenever either one's
   *  padding or font changes. */
  sm: 'h-14 text-sm px-[2.2em] border-2',
} as const;

const CTA_BASE = cn(
  'group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-transparent',
  'font-sans font-bold uppercase tracking-[0.12em]',
  // The LABEL is what changes colour on hover — the outline only warms a
  // shade, and there is no glow at all. (It used to flip the border to full
  // accent under a bloom, which read as the whole button lighting up.)
  // Transform rides a slightly overshooting ease so the lift feels springy
  // rather than mechanical.
  '[transition:color_320ms_cubic-bezier(0.22,0.61,0.36,1),border-color_450ms_cubic-bezier(0.22,0.61,0.36,1),background-color_450ms_ease,transform_260ms_cubic-bezier(0.34,1.56,0.64,1)]',
  'hover:-translate-y-[3px] active:translate-y-[2px] active:scale-[0.99]',
);

/**
 * `onDark` — cream on the near-black hero.
 * `onLight` — ink on the cream pages.
 *
 * In both, hover moves the text to the accent and nudges the outline a bare
 * step in the same direction. No box-shadow in any state.
 */
export function ctaClasses(
  tone: 'onDark' | 'onLight' = 'onDark',
  size: keyof typeof CTA_SIZES = 'lg',
) {
  return cn(
    CTA_BASE,
    CTA_SIZES[size],
    tone === 'onDark'
      ? cn(
          'border-flame-50/90 text-flame-50',
          'hover:text-primary hover:border-primary/45 hover:bg-primary/[0.04]',
        )
      : cn(
          'border-ink text-ink',
          'hover:text-primary hover:border-primary/40 hover:bg-primary/[0.03]',
        ),
  );
}
