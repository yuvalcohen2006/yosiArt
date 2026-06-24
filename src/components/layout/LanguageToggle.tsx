import { useLocale } from '@/hooks/useLocale';

/**
 * Functional locale switch. Clicking either side flips the whole site —
 * `<html lang>` + `<html dir>` are synced inside `src/i18n` on change.
 */
export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center text-[11.5px] uppercase tracking-[0.176em] select-none"
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        aria-label="Switch site language to English"
        className={[
          'transition-opacity duration-300 hover:opacity-100',
          locale === 'en' ? 'opacity-100' : 'opacity-40',
        ].join(' ')}
      >
        EN
      </button>
      <span aria-hidden className="mx-2 opacity-30">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale('he')}
        aria-pressed={locale === 'he'}
        aria-label="החלף את שפת האתר לעברית"
        className={[
          'font-sans transition-opacity duration-300 hover:opacity-100',
          locale === 'he' ? 'opacity-100' : 'opacity-40',
        ].join(' ')}
      >
        עב
      </button>
    </div>
  );
}
