import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { ctaClasses } from './cta-style';

/**
 * The hero's primary CTA — an outlined button on the dark stage that opens
 * the gallery, the same destination family the rail's "Explore" leads to.
 *
 *  - Rest: cream outline + cream label, matching the headline above it.
 *  - Hover: the LABEL moves to the accent blue while the outline warms a bare
 *    shade — no glow — and the button lifts on a springy ease. The chevron
 *    nudges in the reading direction.
 *  - Click: presses down, then routes to the works gallery.
 *
 * A real <Link>, so middle-click and "open in new tab" behave and the
 * destination is announced to assistive tech.
 */
export function GetStartedButton() {
  const { t } = useLocale();

  return (
    <Link
      to="/works"
      // Shared with the collection rail's "Explore" — see ui/cta-style.ts.
      className={ctaClasses('onDark')}
    >
      <span className="relative z-10 inline-flex items-center gap-[0.7em]">
        <span>{t('home.cta')}</span>
        <ChevronRight
          aria-hidden
          strokeWidth={2.5}
          className="h-[1.1em] w-[1.1em] transition-transform duration-300 ltr:group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
        />
      </span>
    </Link>
  );
}
