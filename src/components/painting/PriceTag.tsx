import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useCurrency } from '@/hooks/useCurrency';
import { useIlsToUsdRate } from '@/hooks/useIlsToUsdRate';
import { formatPrice } from '@/lib/formatPrice';
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
 * Hidden, it is covered by a grey strip laid over the figure — a card scratched
 * off rather than a control that swaps one thing for another. Clicking fades the
 * strip away while the number behind it resolves out of blur, so the answer
 * surfaces in place instead of appearing from nowhere.
 *
 * The number element is deliberately NEVER unmounted between the two states.
 * Swapping it for a different element on reveal would remount it, and a
 * remounted node has no previous style to transition from — the blur would
 * simply pop off. Only its classes change, so the browser can animate it. The
 * strip is kept mounted for the same reason: an unmounted button cannot fade,
 * it can only vanish.
 *
 * Every price in Sanity is set in shekels, so the shekel figure is the real one
 * and any dollar figure is a live conversion. Which one a visitor sees follows
 * their language (see useCurrency) — there is no switch, so the page shows each
 * visitor the one currency they are actually thinking in.
 */
export default function PriceTag({ priceILS, priceUSD, status }: Props) {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const [revealed, setRevealed] = useState(false);
  // Fetched for anyone who will be SHOWN dollars, not just once they click.
  // While there was a currency switch, "on reveal" was the moment a visitor
  // asked about money and the toggle could cover the wait; without it, a rate
  // landing late would flip a revealed ₪ figure to $ under the reader's eyes.
  // A Hebrew visitor is priced in shekels and still causes no request at all,
  // which is the part of the old laziness worth keeping.
  const { state: rate } = useIlsToUsdRate(priceILS != null && currency === 'USD');

  // Revealing takes the pressed strip out of the tab order, so without this the
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
  // degrades to something rather than nothing. If neither is available the
  // shekel figure stands — the real price is never the thing that goes missing.
  const usd =
    priceILS != null && rate.status === 'success'
      ? roundDownApprox(priceILS * rate.rate)
      : (priceUSD ?? null);

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
          <span
            // Covered, the digits are decoration: the strip over them already
            // says what this is, and a screen reader announcing the price while
            // the visible control still offers to reveal it is incoherent.
            aria-hidden={!revealed}
            className={[
              // `py-1` is load-bearing for alignment, not decoration. It takes
              // the figure's 40px line box to the 48px of the Inquire buttons
              // beside it, so `items-end` on the row lands the strip and the
              // buttons on one bottom edge — and, being equal heights, one top
              // edge too. The padding sits INSIDE the flex item on purpose: the
              // strip used to get its extra height from a negative inset, which
              // bled 4px past the box the row was aligning, so the strip hung
              // visibly below the buttons however the row was aligned.
              'block py-1 font-display text-4xl font-black tabular-nums',
              'transition-[filter,color] duration-700 ease-out motion-reduce:transition-none',
              revealed ? 'text-ink blur-0' : 'select-none text-mist blur-[10px]',
            ].join(' ')}
          >
            {lead}
          </span>
        </span>

        {/* The strip. `w-max` with `min-w-full` makes it at least as wide as the
            figure it covers and wider still if its own label needs the room, so
            it never crops the words and never leaves a digit peeking out the
            end. `start-0` anchors it at the reading edge, so Hebrew mirrors it
            for free. `inset-y-0` fills the padded box above — still standing
            proud of the glyphs, so it reads as something laid ON the price
            rather than as a button sized to it, but now flush with the row's
            alignment edge and comfortably over the 44px target. */}
        <button
          type="button"
          onClick={() => setRevealed(true)}
          // Hidden from both the reader and the tab order once it has been
          // used, since it stays mounted only so it can fade.
          aria-hidden={revealed}
          tabIndex={revealed ? -1 : 0}
          className={[
            'absolute inset-y-0 start-0 flex w-max min-w-full items-center justify-center',
            'rounded-md bg-flame-300 px-5',
            'font-sans text-sm font-medium uppercase tracking-[0.16em] text-ink',
            'transition-[opacity,filter] duration-500 ease-out motion-reduce:transition-none',
            // Darkening the fill keeps the label's contrast comfortably past AA
            // (5.8:1 at the hover shade), which recolouring the text to the
            // accent would not — #c44f12 on this grey is only 2.7:1.
            'hover:brightness-95',
            revealed ? 'pointer-events-none opacity-0' : 'opacity-100',
          ].join(' ')}
        >
          {t('painting.showPrice')}
        </button>
      </span>
    </span>
  );
}
