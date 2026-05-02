import { useCurrency } from '@/hooks/useCurrency';

/**
 * Functional currency switch. Same shape as LanguageToggle — two buttons,
 * the active one is full ink, the other is muted. Persisted via the
 * `useCurrency` store, so prices update instantly across the page.
 */
export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Currency"
      className="inline-flex items-center text-[11px] tracking-[0.2em] select-none"
    >
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        aria-pressed={currency === 'USD'}
        className={[
          'transition-colors duration-300 hover:text-ink',
          currency === 'USD' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        $
      </button>
      <span aria-hidden className="mx-2 text-ink/25">
        /
      </span>
      <button
        type="button"
        onClick={() => setCurrency('ILS')}
        aria-pressed={currency === 'ILS'}
        className={[
          'transition-colors duration-300 hover:text-ink',
          currency === 'ILS' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        ₪
      </button>
    </div>
  );
}
