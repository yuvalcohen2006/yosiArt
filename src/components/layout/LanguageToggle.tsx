import { useLocale } from '@/hooks/useLocale';

/**
 * Functional locale switch. Clicking either side flips the whole site —
 * `<html lang>` + `<html dir>` are synced inside `src/i18n` on change.
 * Both halves share one identical style so EN and עב match exactly; the
 * active language is shown in the indigo primary, hover is the same indigo.
 */
export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  // Same family/weight/size as the other navbar buttons (Assistant / medium /
  // 16px). `text-base` is NOT bumped by the RTL size rules, so EN and HE render
  // at an identical fixed 16px.
  const itemClass = (active: boolean) =>
    [
      'font-sans text-base font-medium leading-none transition-colors duration-300 hover:text-primary',
      active ? 'text-primary' : 'opacity-50',
    ].join(' ');

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center gap-2 select-none"
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        aria-label="Switch site language to English"
        className={itemClass(locale === 'en')}
      >
        EN
      </button>
      <span aria-hidden className="text-base leading-none opacity-30">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale('he')}
        aria-pressed={locale === 'he'}
        aria-label="החלף את שפת האתר לעברית"
        className={itemClass(locale === 'he')}
      >
        עב
      </button>
    </div>
  );
}
