/*
  Visual-only stub. Wired to react-i18next in milestone 3.
  Shows the current locale highlighted; the inactive option is muted.
*/
type Props = { locale?: 'en' | 'he' };

export default function LanguageToggle({ locale = 'en' }: Props) {
  return (
    <div
      className="inline-flex items-center text-[11px] uppercase tracking-[0.2em] select-none"
      aria-label="Language"
    >
      <span
        className={[
          'transition-colors duration-300',
          locale === 'en' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        EN
      </span>
      <span aria-hidden className="mx-2 text-ink/25">
        /
      </span>
      <span
        className={[
          'font-sans transition-colors duration-300',
          locale === 'he' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        עב
      </span>
    </div>
  );
}
