import { useCurrency } from '@/hooks/useCurrency';
import { useLocale } from '@/hooks/useLocale';

/**
 * Functional currency switch. Same shape as LanguageToggle — two buttons,
 * the active one is full ink, the other is muted. Persisted via the
 * `useCurrency` store, so prices update instantly across the page.
 */
export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  const { t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t('currency.label')}
      className="inline-flex items-center text-[11.5px] tracking-[0.176em] select-none"
    >
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        aria-pressed={currency === 'USD'}
        aria-label={t('currency.usd')}
        className={[
          'transition-opacity duration-300 hover:opacity-100',
          currency === 'USD' ? 'opacity-100' : 'opacity-40',
        ].join(' ')}
      >
        $
      </button>
      <span aria-hidden className="mx-2 opacity-30">
        /
      </span>
      <button
        type="button"
        onClick={() => setCurrency('ILS')}
        aria-pressed={currency === 'ILS'}
        aria-label={t('currency.ils')}
        className={[
          'transition-opacity duration-300 hover:opacity-100',
          currency === 'ILS' ? 'opacity-100' : 'opacity-40',
        ].join(' ')}
      >
        ₪
      </button>
    </div>
  );
}
