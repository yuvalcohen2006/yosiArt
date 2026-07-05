import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * "Get Started" CTA — large hero variant.
 *
 *  - Sizing: intentionally large, scaled off its own font size (padding, label
 *    offset, icon box + icon are all `em`-based), so it reads as a big button
 *    rather than a stretched small one.
 *  - Label font: `font-sans` (Assistant) — the same family/weight as the navbar
 *    Sign In button.
 *  - Fill: `flame-700` (palette dark taupe) with a `flame-50` label — the
 *    dark anchor of the fixed palette, so the CTA grounds the light canvas.
 *  - Expanding box (`<i>`): `primary` — it inherits the site accent (burnt
 *    orange #eb5e28 = flame-500) — with a `flame-900` chevron (dark on the
 *    mid-bright accent for contrast, ~4.5:1).
 *
 * Motion: hover expands the box across the button (width, 500ms) while the
 * label fades; pressing squeezes the box (scale, 250ms — deliberately twice
 * as fast as the expand). A click locks that squeezed state and swaps the
 * chevron for a spinner (single round-capped arc in the chevron's color,
 * 0.96em — 20% under the chevron — at ~3px rendered stroke, 1s/rev) until
 * the browser navigates away — no timeout, and hover no longer affects the
 * box while locked.
 */
export function GetStartedButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      onClick={() => setLoading(true)}
      aria-busy={loading}
      className="group relative h-auto overflow-hidden rounded-md border border-flame-700 bg-flame-700 px-[1.75em] py-[0.7em] font-sans text-[clamp(1.25rem,2vw,2.25rem)] text-flame-50 hover:bg-flame-700"
    >
      <span
        className={cn(
          'mr-[2.3em] transition-opacity duration-500',
          loading ? 'opacity-0' : 'group-hover:opacity-0',
        )}
      >
        Get Started
      </span>
      <i
        className={cn(
          'absolute bottom-[0.35em] right-[0.35em] top-[0.35em] z-10 grid w-1/4 place-items-center rounded-md bg-primary text-flame-900 [transition:width_500ms_cubic-bezier(0.4,0,0.2,1),transform_250ms_cubic-bezier(0.4,0,0.2,1)]',
          loading
            ? 'w-[calc(100%-0.7em)] scale-95'
            : 'group-hover:w-[calc(100%-0.7em)] group-active:scale-95',
        )}
      >
        {loading ? (
          /* strokeWidth 2.1 in the 24-unit viewBox ≈ 3px rendered at this
             size — ~1.5× the old 2px ring. */
          <LoaderCircle
            aria-hidden="true"
            strokeWidth={2.1}
            className="h-[0.96em] w-[0.96em] animate-spin"
          />
        ) : (
          <ChevronRight
            strokeWidth={2}
            aria-hidden="true"
            className="h-[1.2em] w-[1.2em]"
          />
        )}
      </i>
    </Button>
  );
}
