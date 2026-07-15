import { useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * "Get Started" CTA — ripple button in our Flame palette.
 *
 *  - Rest: ink outline + ink label — the exact colour of the headline above,
 *    so the button reads as part of the same composition.
 *  - Hover: a staggered fade into burnt orange — the border warms first, the
 *    label follows a beat later — while the button lifts on a springy ease
 *    with a soft drop shadow and only a whisper of orange glow. The chevron
 *    nudges forward in the reading direction.
 *  - Click: the button is pressed back down; an orange ripple expands from
 *    the cursor to flood the whole box and STAYS. Once the fill lands, the
 *    label swaps for a centred spinning cycle icon.
 *
 * Font / text / size / border weight are the current button's, unchanged.
 */
export function GetStartedButton() {
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; size: number } | null>(null);

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    setRipple({
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      size,
    });
    setLoading(true);
    // let the ripple flood the box first, then reveal the spinner
    window.setTimeout(() => setShowSpinner(true), 380);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-busy={loading}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-transparent',
        'border-[4px] font-sans font-bold uppercase tracking-[0.12em]',
        'px-[1.6em] py-[0.72em] text-[clamp(1rem,1.55vw,1.6rem)]',
        // Staggered colour story: border warms into orange first, the label
        // follows 120ms behind — a fade that travels through the button
        // instead of flipping all at once. Transform rides a slightly
        // overshooting ease so the lift feels springy, not mechanical.
        '[transition:border-color_450ms_cubic-bezier(0.22,0.61,0.36,1),color_450ms_cubic-bezier(0.22,0.61,0.36,1)_120ms,background-color_450ms_ease,box-shadow_450ms_ease,transform_260ms_cubic-bezier(0.34,1.56,0.64,1)]',
        loading
          ? // Pressed + landed: pushed down, orange, whisper of glow.
            'translate-y-[2px] scale-[0.98] border-primary text-primary shadow-[0_0_14px_-9px_rgba(235,94,40,0.55)]'
          : cn(
              'border-ink text-ink',
              // Lift on hover: real drop shadow does the "floating" work, the
              // orange glow is kept very subtle underneath it.
              'hover:-translate-y-[3px] hover:border-primary hover:text-primary hover:bg-primary/[0.04]',
              'hover:shadow-[0_16px_30px_-18px_rgba(37,36,34,0.45),0_0_14px_-9px_rgba(235,94,40,0.5)]',
              // Push back down on click.
              'active:translate-y-[2px] active:scale-[0.99] active:shadow-[0_4px_10px_-10px_rgba(37,36,34,0.4)]',
            ),
      )}
    >
      {/* orange ripple — expands from the click point to flood the box, then stays */}
      {ripple && (
        <span
          aria-hidden
          className="animate-rippling pointer-events-none absolute rounded-full bg-primary"
          style={{
            width: ripple.size,
            height: ripple.size,
            top: ripple.y,
            left: ripple.x,
          }}
        />
      )}

      {/* label + chevron — fade out once the spinner takes over */}
      <span
        className={cn(
          'relative z-10 inline-flex items-center gap-[0.7em] transition-opacity duration-200',
          showSpinner && 'opacity-0',
        )}
      >
        <span>Get Started</span>
        <ChevronRight
          aria-hidden
          strokeWidth={2.5}
          className="h-[1.1em] w-[1.1em] transition-transform duration-300 ltr:group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
        />
      </span>

      {/* spinner — centred on the rippled fill */}
      {showSpinner && (
        <span className="absolute inset-0 z-10 grid place-items-center">
          <LoaderCircle
            aria-hidden
            strokeWidth={2.3}
            className="h-[1.35em] w-[1.35em] animate-spin text-flame-50"
          />
        </span>
      )}
    </button>
  );
}
