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
          'transition-colors duration-300 hover:text-ink',
          locale === 'en' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        EN
      </button>
      <span aria-hidden className="mx-2 text-ink/25">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale('he')}
        aria-pressed={locale === 'he'}
        aria-label="החלף את שפת האתר לעברית"
        className={[
          'font-sans transition-colors duration-300 hover:text-ink',
          locale === 'he' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        עב
      </button>
    </div>
  );
}
