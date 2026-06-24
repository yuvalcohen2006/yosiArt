import { cn } from '@/lib/utils';

type Props = {
  showRadialGradient?: boolean;
};

/**
 * Animated aurora backdrop. Adapted from the Aceternity UI "Aurora
 * Background" for this Vite + Tailwind project: the Next.js `"use client"`
 * directive is dropped, the dark-mode variants are removed (the site is
 * light-only), and instead of wrapping page children it renders as a
 * standalone fixed layer pinned behind everything (`-z-10`) — the same slot
 * the old paper texture used.
 *
 * The colour stops (`--blue-500`, `--violet-200`, …) and `--white` /
 * `--transparent` come from CSS variables declared in src/index.css `:root`,
 * and the drift comes from the `aurora` keyframes in tailwind.config.ts.
 */
export default function AuroraBackground({ showRadialGradient = true }: Props) {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-paper pointer-events-none"
    >
      <div
        className={cn(
          `
          [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
          [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
          [background-image:var(--white-gradient),var(--aurora)]
          [background-size:300%,_200%]
          [background-position:50%_50%,50%_50%]
          filter blur-[10px] invert
          after:content-[""] after:absolute after:inset-0
          after:[background-image:var(--white-gradient),var(--aurora)]
          after:[background-size:200%,_100%]
          after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
          pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform`,
          showRadialGradient &&
            `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
        )}
      />
    </div>
  );
}
