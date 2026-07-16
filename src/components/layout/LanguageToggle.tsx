import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { NAV_LIFT } from '@/components/ui/nav-lift';

/**
 * Single-button locale switch. Shows the language you'll switch TO — "עברית"
 * while the site is in English, "English" while it's in Hebrew — and one click
 * flips the whole site (`<html lang>` + `<html dir>` are synced inside
 * `src/i18n` on change). Lifts on hover / settles on click like the other
 * navbar controls.
 */
export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const toHebrew = locale === 'en';
  const target = toHebrew ? 'he' : 'en';
  const label = toHebrew ? 'עברית' : 'English';

  return (
    <button
      type="button"
      onClick={() => setLocale(target)}
      aria-label={
        toHebrew
          ? 'החלף את שפת האתר לעברית'
          : 'Switch site language to English'
      }
      // `text-base` is deliberately NOT bumped by the RTL size rules, so the
      // label stays a fixed 16px whichever language it shows.
      className={cn(
        'select-none rounded-md px-2 py-1 font-sans text-base font-medium leading-none text-ink hover:text-primary',
        NAV_LIFT,
      )}
    >
      {label}
    </button>
  );
}
