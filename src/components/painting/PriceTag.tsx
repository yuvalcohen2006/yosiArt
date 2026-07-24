import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useIlsToUsdRate } from '@/hooks/useIlsToUsdRate';
import { formatPrice } from '@/lib/formatPrice';
import type { PaintingStatus } from '@/sanity/types';

type Props = {
  priceILS?: number | null;
  priceUSD?: number | null;
  status: PaintingStatus;
};

/**
 * The price, revealed on request.
 *
 * Prices are entered in Sanity in shekels, so the shekel figure leads and the
 * dollar figure underneath is a live conversion, always marked approximate —
 * it is a courtesy for overseas visitors, not a second price the artist quotes.
 * The rate is only requested once someone actually asks to see a price.
 *
 * States: sold (no figure), unpriced (inquire), hidden (the ask), revealed.
 */
export default function PriceTag({ priceILS, priceUSD, status }: Props) {
  const { t } = useLocale();
  const [revealed, setRevealed] = useState(false);
  const { state: rate, retry } = useIlsToUsdRate(revealed && priceILS != null);

  // Revealing REPLACES the button that was just pressed, so without this the
  // keyboard focus point is destroyed and lands back on <body> — the next Tab
  // would restart from the top of the page. Moving focus onto the figure keeps
  // the visitor where they were and is what announces the price to a screen
  // reader (which is why there is no aria-live here as well; both together
  // would announce it twice).
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
  const hasPrice = priceILS != null || priceUSD != null;

  if (!hasPrice) {
    return (
      <span className="flex flex-col gap-1">
        {reservedMark}
        <span className="font-sans text-2xl font-semibold italic text-slate">
          {t('painting.inquireForPrice')}
        </span>
      </span>
    );
  }

  if (!revealed) {
    return (
      <span className="flex flex-col items-start gap-1">
        {reservedMark}
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="inline-flex min-h-11 items-center rounded-md border border-ink/35 px-5 font-sans text-base text-ink transition-colors duration-300 hover:border-primary hover:bg-primary/[0.04] hover:text-primary motion-reduce:transition-none"
        >
          {t('painting.showPrice')}
        </button>
      </span>
    );
  }

  // Shekels lead when present; a piece priced only in dollars still shows.
  const leadLabel =
    priceILS != null
      ? formatPrice(priceILS, 'ILS')
      : priceUSD != null
        ? formatPrice(priceUSD, 'USD')
        : null;

  // The approximate dollar line: live rate first, the stored USD figure as a
  // fallback so a failed request degrades to something rather than nothing.
  const approxUsd =
    priceILS != null && rate.status === 'success'
      ? formatPrice(priceILS * rate.rate, 'USD')
      : priceILS != null && priceUSD != null
        ? formatPrice(priceUSD, 'USD')
        : null;

  return (
    <span className="flex flex-col gap-1">
      {reservedMark}
      <span ref={priceRef} tabIndex={-1} className="outline-none">
        <span className="block font-display text-4xl font-black tabular-nums text-ink">
          {leadLabel}
        </span>
        {priceILS != null && (
          <span className="mt-1 block font-sans text-sm text-slate">
            {rate.status === 'loading' && t('painting.convertingPrice')}
            {approxUsd != null && t('painting.approxUsd', { amount: approxUsd })}
            {rate.status === 'error' && approxUsd == null && (
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
    </span>
  );
}
