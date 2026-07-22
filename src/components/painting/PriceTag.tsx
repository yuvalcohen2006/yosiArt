import { useCurrency } from '@/hooks/useCurrency';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/lib/formatPrice';
import type { PaintingStatus } from '@/sanity/types';

type Props = {
  priceILS?: number | null;
  priceUSD?: number | null;
  status: PaintingStatus;
};

/**
 * Renders the price with four states:
 *  - Sold     → quiet "Sold" label in deep navy with a small dot.
 *  - Reserved → the price, plus a "Reserved" marker above it.
 *  - Priced   → currency-aware formatted amount in display font.
 *  - Unpriced → "Inquire for price" label.
 */
export default function PriceTag({ priceILS, priceUSD, status }: Props) {
  const { t } = useLocale();
  const { currency } = useCurrency();

  if (status === 'sold') {
    return (
      <span className="inline-flex items-center gap-2 eyebrow text-xs text-deep">
        <span className="h-1 w-1 rounded-full bg-deep" />
        {t('painting.statusSold')}
      </span>
    );
  }

  // `reserved` is a real status in the Sanity schema, but nothing rendered it:
  // a reserved piece displayed a plain price and read as available, which can
  // mislead a buyer into enquiring about something already spoken for. It
  // keeps its price and its Inquire buttons deliberately — a reserved piece is
  // still worth asking about — but it now says so.
  const isReserved = status === 'reserved';

  const price = currency === 'ILS' ? priceILS : priceUSD;

  // `==` here is intentional — Sanity returns `null` for empty number
  // fields, but TypeScript's `?:` only models `undefined`. Catch both.
  const reservedMark = isReserved ? (
    <span className="inline-flex items-center gap-2 eyebrow text-xs text-deep">
      <span className="h-1 w-1 rounded-full bg-deep" />
      {t('painting.statusReserved')}
    </span>
  ) : null;

  if (price == null) {
    return (
      <span className="flex flex-col gap-1">
        {reservedMark}
        <span className="font-sans italic font-semibold text-2xl text-slate">
          {t('painting.inquireForPrice')}
        </span>
      </span>
    );
  }

  return (
    <span className="flex flex-col gap-1">
      {reservedMark}
      <span className="font-display font-black text-4xl text-ink">
        {formatPrice(price, currency)}
      </span>
    </span>
  );
}
