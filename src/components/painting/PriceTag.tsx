import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useCurrency } from '@/hooks/useCurrency';
import { useIlsToUsdRate } from '@/hooks/useIlsToUsdRate';
import { formatPrice } from '@/lib/formatPrice';
import SegmentedToggle from '@/components/ui/SegmentedToggle';
import type { PaintingStatus } from '@/sanity/types';

type Props = {
  priceILS?: number | null;
  priceUSD?: number | null;
  status: PaintingStatus;
};

/**
 * Approximate conversions are rounded DOWN to a round figure. A live rate
 * carried to the dollar implies a precision that "roughly this much" does not
 * have, and $3,247 reads as a quote rather than an estimate. Hundreds above
 * $100, tens below, so a small piece can never collapse to $0.
 */
function roundDownApprox(amount: number): number {
  const step = amount >= 100 ? 100 : 10;
  return Math.max(step, Math.floor(amount / step) * step);
}

/**
 * The price, revealed on request.
 *
 * Hidden, the figure is already on screen but blurred out to a pale grey with
 * the ask sitting over it — so the shape and weight of the answer is visible
 * before the click, and the click resolves it rather than replacing one thing
 * with another.
 *
 * The number element is deliberately NEVER unmounted between the two states.
 * Swapping it for a different element on reveal would remount it, and a
 * remounted node has no previous style to transition from — the blur would
 * simply pop off. Only its classes change, so the browser can animate it.
 *
 * Every price in Sanity is set in shekels, so the shekel figure is the real
 * one and any dollar figure here is a live conversion, always marked
 * approximate. The rate is only requested once someone asks to see a price.
 */
export default function PriceTag({ priceILS, priceUSD, status }: Props) {
  const { t } = useLocale();
  const { currency, setCurrency } = useCurrency();
  const [revealed, setRevealed] = useState(false);
  const { state: rate, retry } = useIlsToUsdRate(revealed && priceILS != null);

  // Revealing REMOVES the button that was just pressed, so without this the
  // keyboard focus point is destroyed and lands back on <body> — the next Tab
  // would restart from the top of the page. Moving focus onto the figure keeps
  // the visitor where they were and is what announces the price to a screen
  // reader (which is why there is no aria-live as well; both would announce it
  // twice).
  const priceRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (revealed) priceRef.current?.focus();
  }, [revealed]);

  if (status === 'sold') {
    return (
      <span className="eyebrow inline-flex items-center gap-2 text-xs text-deep">
        <span className="h-1 w-1 rounded-full bg-deep" />
        {t('painting.statusSold')}
      </span>
    );
  }

  // `reserved` is a real status in the Sanity schema, but nothing rendered it:
  // a reserved piece displayed a plain price and read as available, which can
  // mislead a buyer into enquiring about something already spoken for. It keeps
  // its price and its Inquire buttons deliberately — a reserved piece is still
  // worth asking about — but it now says so.
  const reservedMark =
    status === 'reserved' ? (
      <span className="eyebrow inline-flex items-center gap-2 text-xs text-deep">
        <span className="h-1 w-1 rounded-full bg-deep" />
        {t('painting.statusReserved')}
      </span>
    ) : null;

  // `!= null` is intentional — Sanity returns `null` for empty number fields,
  // but TypeScript's `?:` only models `undefined`. Catch both.
  if (priceILS == null && priceUSD == null) {
    return (
      <span className="flex flex-col gap-1">
        {reservedMark}
        <span className="font-sans text-2xl font-semibold italic text-slate">
          {t('painting.inquireForPrice')}
        </span>
      </span>
    );
  }

  // Live rate first; the stored USD figure is the fallback so a failed request
  // degrades to something rather than nothing.
  const usd =
    priceILS != null && rate.status === 'success'
      ? roundDownApprox(priceILS * rate.rate)
      : (priceUSD ?? null);

  // Only offer the switch when both sides can actually be shown.
  const canSwitch = priceILS != null && (usd != null || rate.status === 'loading');
  const showingUsd = currency === 'USD' && usd != null;

  const lead =
    showingUsd && usd != null
      ? formatPrice(usd, 'USD')
      : priceILS != null
        ? formatPrice(priceILS, 'ILS')
        : formatPrice(priceUSD as number, 'USD');

  return (
    <span className="flex flex-col gap-1">
      {reservedMark}

      <span className="relative inline-flex flex-col items-start">
        <span ref={priceRef} tabIndex={-1} className="outline-none">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span
              // Hidden, the digits are decoration: the button over them already
              // says what this is, and a screen reader announcing the price
              // while the visible control still offers to reveal it is
              // incoherent.
              aria-hidden={!revealed}
              className={[
                'block font-display text-4xl font-black tabular-nums',
                'transition-[filter,color] duration-700 ease-out motion-reduce:transition-none',
                revealed ? 'text-ink blur-0' : 'select-none text-mist blur-[10px]',
              ].join(' ')}
            >
              {lead}
            </span>

            {revealed && canSwitch && (
              <SegmentedToggle
                value={currency}
                onChange={setCurrency}
                groupLabel={t('currency.label')}
                options={[
                  { value: 'ILS', label: '₪', ariaLabel: t('currency.ils') },
                  { value: 'USD', label: '$', ariaLabel: t('currency.usd') },
                ]}
              />
            )}
          </span>

          {revealed && priceILS != null && (
            <span className="mt-1.5 block font-sans text-sm text-slate">
              {rate.status === 'loading' && t('painting.convertingPrice')}
              {rate.status !== 'loading' &&
                (showingUsd
                  ? t('painting.pricedIn', {
                      amount: formatPrice(priceILS, 'ILS'),
                    })
                  : usd != null
                    ? t('painting.approxUsd', { amount: formatPrice(usd, 'USD') })
                    : null)}
              {rate.status === 'error' && usd == null && (
                <button
                  type="button"
                  onClick={retry}
                  className="underline underline-offset-4 transition-colors hover:text-ink"
                >
                  {t('painting.conversionFailed')}
                </button>
              )}
            </span>
          )}
        </span>

        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="absolute inset-0 flex items-center justify-start"
          >
            <span className="inline-flex min-h-11 items-center rounded-md border border-ink/35 bg-paper/85 px-5 font-sans text-base text-ink backdrop-blur-[2px] transition-colors duration-300 hover:border-primary hover:text-primary motion-reduce:transition-none">
              {t('painting.showPrice')}
            </span>
          </button>
        )}
      </span>
    </span>
  );
}
