type Props = {
  /** Tailwind sizing utilities (`h-6 w-6` etc.) — keeps the API
   *  unopinionated so each call site can size + colour to taste. */
  className?: string;
};

/**
 * Minimal circular spinner. Two SVG circles — a faint full ring + a
 * 90° arc that rotates — give the classic "loading" feel without any
 * keyframe definitions: `animate-spin` is built into Tailwind.
 */
export default function Spinner({ className = '' }: Props) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="2"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
