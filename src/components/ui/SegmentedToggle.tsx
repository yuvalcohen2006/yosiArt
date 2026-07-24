import { cn } from '@/lib/utils';

export type SegmentedOption<T extends string> = {
  value: T;
  /** Visible text on the segment. Keep it to a word or two. */
  label: string;
  /** Spoken name, when the visible label is an abbreviation ("cm", "$"). */
  ariaLabel?: string;
};

type Props<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  options: SegmentedOption<T>[];
  /** Names the group as a whole, e.g. "Measurement unit". */
  groupLabel: string;
  className?: string;
};

/**
 * A two-or-three-way switch: a track, with the active choice filled.
 *
 * Shared rather than written per use so the unit switch and the currency
 * switch cannot drift apart — they sit within a few hundred pixels of each
 * other on the painting page, and two controls doing the same job in slightly
 * different shapes is the kind of thing nobody reports but everybody feels.
 *
 * `aria-pressed` rather than a radiogroup: these are toggle buttons that take
 * effect immediately, not a choice that gets submitted.
 */
export default function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  groupLabel,
  className,
}: Props<T>) {
  return (
    <span
      role="group"
      aria-label={groupLabel}
      className={cn(
        'inline-flex items-center rounded-md border border-line bg-mist/50 p-0.5 font-sans text-sm',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            aria-label={option.ariaLabel}
            // The filled segment is a dark plate carrying light text, so it
            // has to declare itself to high-contrast mode
            // (scripts/auditContrast.mjs).
            data-surface={active ? 'dark' : undefined}
            className={cn(
              // min-h-10 plus the track's padding clears the 44px touch target.
              'inline-flex min-h-10 items-center rounded-[4px] px-3.5 transition-colors duration-200 motion-reduce:transition-none',
              active
                ? 'bg-ink font-semibold text-paper'
                : 'text-slate hover:text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </span>
  );
}
