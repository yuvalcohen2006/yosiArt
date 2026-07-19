import { Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';

type Props = {
  /** Header is the default; footer is a touch smaller and slightly muted. */
  variant?: 'header' | 'footer';
  /** On a dark backdrop (e.g. the landing hero) invert the dark signature
   *  to light and drop the multiply blend so it stays visible. */
  onDark?: boolean;
};

/**
 * Brand mark — Yosi's hand-drawn signature.
 * On light surfaces `mix-blend-multiply` is a defensive pick: any near-white
 * anti-alias artifacts at the edges of the PNG vanish into the light
 * background instead of showing as a halo. On dark surfaces we `invert` the
 * dark signature to light instead (multiply would render it invisible).
 */
export default function Logo({ variant = 'header', onDark = false }: Props) {
  const isFooter = variant === 'footer';
  const { t } = useLocale();
  return (
    <Link
      to="/"
      aria-label={t('nav.homeAria')}
      className="inline-flex items-center group"
    >
      <img
        src="/signature.png"
        alt=""
        aria-hidden
        className={[
          'object-contain w-auto transition-[opacity,filter] duration-300',
          onDark ? 'invert' : 'mix-blend-multiply',
          isFooter
            ? 'h-14 opacity-75 group-hover:opacity-100'
            : 'h-14 md:h-[68px] opacity-90 group-hover:opacity-100',
        ].join(' ')}
      />
    </Link>
  );
}
