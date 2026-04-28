import { Link } from 'react-router-dom';

type Props = {
  /** When true, the logo is sized for the footer (slightly smaller, muted). */
  variant?: 'header' | 'footer';
};

/**
 * Minimal wordmark — Cormorant italic with a small teal dot.
 * No image asset; renders crisp at any size and respects RTL automatically.
 */
export default function Logo({ variant = 'header' }: Props) {
  const isFooter = variant === 'footer';
  return (
    <Link
      to="/"
      aria-label="YosiArt — home"
      className="inline-flex items-baseline gap-1.5 group"
    >
      <span
        className={[
          'font-display italic font-medium tracking-tight transition-colors duration-300',
          isFooter
            ? 'text-2xl text-ink/90 group-hover:text-teal'
            : 'text-3xl text-ink group-hover:text-teal',
        ].join(' ')}
      >
        YosiArt
      </span>
      <span
        aria-hidden
        className="block h-1.5 w-1.5 rounded-full bg-teal transition-transform duration-300 group-hover:scale-125"
      />
    </Link>
  );
}
