import { useLayoutEffect, useRef, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useCurrency } from '@/hooks/useCurrency';
import { useIlsToUsdRate } from '@/hooks/useIlsToUsdRate';
import { formatPrice } from '@/lib/formatPrice';
import type { PaintingStatus } from '@/sanity/types';

type Props = {
  priceILS?: number | null;
  priceUSD?: number | null;
  status: PaintingStatus;
  /** The painting's own dominant colour (`#rrggbb`) — becomes the fill of the
   *  reveal strip, so the control reads as belonging to the work above it. */
  accentHex?: string | null;
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

/* ── colour maths ────────────────────────────────────────────────────────────
   The strip's fill is arbitrary editor-supplied data (Sanity's extracted
   dominant colour), so its legibility cannot be eyeballed once at design time
   the way a fixed palette colour can — it has to be guaranteed for every hex
   the CMS could ever hand us. That is what this block does.

   NOTE: the sRGB transfer function and weights below are the same ones
   scripts/auditContrast.mjs implements for the build-time gate. They are
   duplicated rather than shared because that script is a standalone .mjs with
   no bundler; if a third consumer ever appears, lift both into one module. */

const srgbToLinear = (c: number) =>
  c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const linearToSrgb = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;

/** Relative luminance (WCAG 2.1) of three linear-light channels. */
const lum = (r: number, g: number, b: number) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b;

/**
 * The two luminance zones in which the strip is provably legible.
 *
 * Both bounds are derived, not chosen, and they account for the two things
 * that act on this button AFTER a naive "is it dark?" test would have run:
 *
 *   1. `hover:brightness-95` multiplies every channel — the LABEL as well as
 *      the fill — so the resting ratio is not the worst case.
 *   2. High-contrast mode (index.css) forces the label to #0a0a0a on a light
 *      fill, while leaving that fill untouched: the black is not the pure
 *      #000 the inline style asks for, so it needs a lighter fill to clear AA.
 *
 * Working, at the 4.5:1 AA floor for this 14px label:
 *   white  — hover dims #fff to ~#f2f2f2 (L 0.886), so the fill must sit at
 *            L <= 0.158 while hovered. brightness(.95) costs ~10% of a mid
 *            fill's luminance, putting the resting ceiling at ~0.175; 0.170
 *            keeps a margin for the rounding to 8-bit channels.
 *   black  — hover dims #0a0a0a to ~#090909 (L 0.0027), so the fill must sit
 *            at L >= 0.187 while hovered, i.e. ~0.207 at rest. 0.216 rounds up.
 *
 * Both bounds are checked against every published painting, in all four
 * states (rest / hover / high-contrast / high-contrast+hover), rather than
 * trusted from this arithmetic alone.
 *
 * Between them is a real dead band where NEITHER label colour clears AA. Any
 * fill landing there is nudged out of it by `resolveFill` below rather than
 * being shipped illegible — the painting keeps its hue, and only its lightness
 * moves, by at most ~10%.
 */
const WHITE_TEXT_AT_OR_BELOW = 0.17;
const BLACK_TEXT_AT_OR_ABOVE = 0.216;

type Fill = { background: string; color: string; dark: boolean };

/**
 * Turn a CMS hex into a fill that is guaranteed legible, or null if the value
 * is not a colour we can reason about (the caller then falls back to the fixed
 * palette). The returned `background` is always re-serialised from the parsed
 * channels, never the raw input — a value that parsed but was not valid CSS
 * (a bare `a1b2c3` with no `#`) would otherwise be written straight into the
 * style attribute, silently dropped by CSSOM, and leave the price uncovered.
 */
function resolveFill(hex: string): Fill | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;

  const int = parseInt(m[1], 16);
  let [r, g, b] = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) =>
    srgbToLinear(v / 255),
  );
  const l = lum(r, g, b);

  // Nudge out of the dead band, toward whichever edge is nearer. Luminance is
  // a linear combination of the linear-light channels and the three weights
  // sum to 1, so both moves below hit their target exactly, in closed form —
  // no iteration, and the hue is preserved because every channel is scaled or
  // blended by the same factor.
  let target: number | null = null;
  if (l > WHITE_TEXT_AT_OR_BELOW && l < BLACK_TEXT_AT_OR_ABOVE) {
    const mid = (WHITE_TEXT_AT_OR_BELOW + BLACK_TEXT_AT_OR_ABOVE) / 2;
    target = l < mid ? WHITE_TEXT_AT_OR_BELOW : BLACK_TEXT_AT_OR_ABOVE;
  }
  if (target != null) {
    if (target < l) {
      const k = target / l; // scale toward black
      [r, g, b] = [r * k, g * k, b * k];
    } else {
      const t = (target - l) / (1 - l); // blend toward white
      [r, g, b] = [r + (1 - r) * t, g + (1 - g) * t, b + (1 - b) * t];
    }
  }

  const finalL = target ?? l;
  const to255 = (c: number) =>
    Math.max(0, Math.min(255, Math.round(linearToSrgb(c) * 255)));
  const background = `#${[r, g, b].map((c) => to255(c).toString(16).padStart(2, '0')).join('')}`;

  const dark = finalL <= WHITE_TEXT_AT_OR_BELOW;
  return { background, color: dark ? '#ffffff' : '#000000', dark };
}

/**
 * The price, revealed on request.
 *
 * Hidden, it is covered by a strip laid over the figure — a card scratched off
 * rather than a control that swaps one thing for another. Clicking fades the
 * strip away while the number behind it resolves out of blur, so the answer
 * surfaces in place instead of appearing from nowhere.
 *
 * The strip is filled with the PAINTING'S OWN dominant colour, pulled from
 * Sanity's palette metadata, so the one control under each artwork is tinted by
 * that artwork. Its label flips between white and black on the fill's measured
 * luminance, and the fill itself is nudged out of the narrow band where neither
 * label would be legible — see `resolveFill`. That is what keeps an arbitrary
 * colour off the CMS from ever producing an unreadable button.
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
export default function PriceTag({
  priceILS,
  priceUSD,
  status,
  accentHex,
}: Props) {
  const { t } = useLocale();
  const { currency } = useCurrency();
  const [revealed, setRevealed] = useState(false);
  // Fetched for anyone who will be SHOWN dollars, not just once they click.
  // While there was a currency switch, "on reveal" was the moment a visitor
  // asked about money and the toggle could cover the wait; without it, a rate
  // landing late would flip a revealed shekel figure to dollars under the
  // reader's eyes. A Hebrew visitor is priced in shekels and still causes no
  // request at all, which is the part of the old laziness worth keeping.
  const { state: rate } = useIlsToUsdRate(priceILS != null && currency === 'USD');

  // Revealing takes the pressed strip out of the tab order, so without this the
  // keyboard focus point is destroyed and lands back on <body> — the next Tab
  // would restart from the top of the page. Moving focus onto the figure keeps
  // the visitor where they were and is what announces the price to a screen
  // reader (which is why there is no aria-live as well; both would announce it
  // twice).
  //
  // `useLayoutEffect` rather than `useEffect` is load-bearing: the same commit
  // that reveals the price also marks the button `aria-hidden`, and a passive
  // effect runs AFTER paint — leaving at least one frame in which the focused
  // element is aria-hidden, which ARIA forbids and which can drop a screen
  // reader's virtual cursor back to the top of the document.
  const priceRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
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
      <span className="flex flex-col items-center gap-1">
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

  // A painting with no palette metadata (or an unparseable value) falls back to
  // the neutral flame-300 the strip carried before it was tinted.
  const fill = accentHex ? resolveFill(accentHex) : null;

  return (
    <span className="flex flex-col items-center gap-1">
      {reservedMark}

      <span className="relative inline-flex flex-col items-center">
        <span ref={priceRef} tabIndex={-1}>
          <span
            // Covered, the digits are decoration: the strip over them already
            // says what this is, and a screen reader announcing the price while
            // the visible control still offers to reveal it is incoherent.
            aria-hidden={!revealed}
            className={[
              // `py-1` is load-bearing, not decoration: it takes the figure's
              // line box up to the height of a standard control, so the strip
              // laid over it is a comfortable target — and it keeps that height
              // INSIDE the flow box rather than bleeding out of it.
              'block py-1 font-display text-4xl font-black tabular-nums',
              'transition-[filter,color] duration-700 ease-out motion-reduce:transition-none',
              revealed ? 'text-ink blur-0' : 'select-none text-mist blur-[10px]',
            ].join(' ')}
          >
            {lead}
          </span>
        </span>

        {/* The strip. Centred ON the figure rather than anchored to its start,
            because the label is wider than most prices — pinned to one edge it
            would hang off to that side and stop reading as a cover laid over
            the number. `start-1/2` resolves to left in English and right in
            Hebrew, and the paired translate is mirrored to match, so it centres
            in both directions without a direction check in JS. */}
        <button
          type="button"
          onClick={() => setRevealed(true)}
          // The fill is an arbitrary colour off the CMS, so the high-contrast
          // accessibility mode has to be told which way this surface reads.
          // With this set it forces a true #0a0a0a fill and white text; without
          // it — the light-fill case — the same stylesheet blackens the label
          // and leaves the fill alone, which is exactly why the light branch's
          // luminance floor above is derived against #0a0a0a rather than #000.
          data-surface={fill?.dark ? 'dark' : undefined}
          // Hidden from both the reader and the tab order once it has been
          // used, since it stays mounted only so it can fade.
          aria-hidden={revealed}
          tabIndex={revealed ? -1 : 0}
          style={
            fill
              ? { backgroundColor: fill.background, color: fill.color }
              : undefined
          }
          className={[
            'absolute inset-y-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2',
            'flex w-max min-w-full items-center justify-center rounded-md px-5',
            'font-sans text-sm font-medium uppercase tracking-[0.176em]',
            // Only reached when the painting has no palette colour to lend.
            fill ? null : 'bg-flame-300 text-ink',
            'transition-[opacity,filter] duration-500 ease-out motion-reduce:transition-none',
            // Safe on every fill: both luminance bounds above are derived with
            // this 5% dim already applied, to the label as well as the fill.
            'hover:brightness-95',
            revealed ? 'pointer-events-none opacity-0' : 'opacity-100',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {t('painting.showPrice')}
        </button>
      </span>
    </span>
  );
}
