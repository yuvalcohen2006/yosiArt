import { Link } from 'react-router-dom';

type Props = {
  /** Header is the default; footer is a touch smaller and slightly muted. */
  variant?: 'header' | 'footer';
};

/**
 * Brand mark — Yosi's hand-drawn signature.
 * `mix-blend-multiply` is a defensive pick: if there are any near-white
 * anti-alias artifacts at the edges of the PNG, they vanish into the
 * paper-textured background instead of showing as a halo.
 */
export default function Logo({ variant = 'header' }: Props) {
  const isFooter = variant === 'footer';
  return (
    <Link
      to="/"
      aria-label="YosiArt — home"
      className="inline-flex items-center group"
    >
      <img
        src="/signature.png"
        alt=""
        aria-hidden
        className={[
          'object-contain w-auto transition-opacity duration-300 mix-blend-multiply',
          isFooter
            ? 'h-14 opacity-75 group-hover:opacity-100'
            : 'h-14 md:h-[68px] opacity-90 group-hover:opacity-100',
        ].join(' ')}
      />
    </Link>
  );
}
