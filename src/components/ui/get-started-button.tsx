import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

/**
 * "Get Started" CTA — large hero variant.
 *
 *  - Sizing: intentionally large, scaled off its own font size (padding, label
 *    offset, icon box + icon are all `em`-based), so it reads as a big button
 *    rather than a stretched small one.
 *  - Label font: `font-sans` (Assistant) — the same family/weight as the navbar
 *    Sign In button.
 *  - Border: `ink/10`, matching the expanding hover box (`<i>`) exactly.
 *
 * The hover/expand mechanic (icon panel grows, label fades) is unchanged —
 * only sizing, font, and border were touched.
 */
export function GetStartedButton() {
  return (
    <Button className="group relative h-auto overflow-hidden rounded-md border border-ink/10 bg-white px-[1.75em] py-[0.7em] font-sans text-[clamp(1.25rem,2vw,2.25rem)] text-ink hover:bg-white">
      <span className="mr-[2.3em] transition-opacity duration-500 group-hover:opacity-0">
        Get Started
      </span>
      <i className="absolute bottom-[0.35em] right-[0.35em] top-[0.35em] z-10 grid w-1/4 place-items-center rounded-sm bg-ink/10 text-ink transition-all duration-500 group-hover:w-[calc(100%-0.7em)] group-active:scale-95">
        <ChevronRight
          strokeWidth={2}
          aria-hidden="true"
          className="h-[1.2em] w-[1.2em]"
        />
      </i>
    </Button>
  );
}
