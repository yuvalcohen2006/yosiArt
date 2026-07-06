import { useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * "Get Started" CTA — ripple button in our Flame palette.
 *
 *  - Rest: grey outline + grey label (understated / inactive).
 *  - Hover: outline + label lift to burnt-orange (`primary` = flame-500) with a
 *    soft orange glow — the button "comes alive".
 *  - Click: an orange ripple expands from the cursor to flood the whole box and
 *    STAYS (the rippled colour is kept). The button dips a touch smaller and,
 *    once the fill lands, swaps its label for a centred spinning cycle icon.
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
        'relative inline-flex items-center justify-center overflow-hidden rounded-md bg-transparent',
        'border-[4px] font-sans font-bold uppercase tracking-[0.12em]',
        'px-[1.6em] py-[0.72em] text-[clamp(1rem,1.55vw,1.6rem)]',
        '[transition:color_300ms_ease,border-color_300ms_ease,box-shadow_300ms_ease,transform_200ms_ease]',
        loading
          ? 'scale-[0.96] border-primary text-primary shadow-[0_0_26px_-3px_rgba(235,94,40,0.6)]'
          : 'border-slate text-slate hover:border-primary hover:text-primary hover:shadow-[0_0_26px_-3px_rgba(235,94,40,0.6)]',
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
          className="h-[1.1em] w-[1.1em]"
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
