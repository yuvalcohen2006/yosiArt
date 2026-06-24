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
 * Renders the price with three states:
 *  - Sold     → quiet "Sold" label in deep navy with a small dot.
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

  const price = currency === 'ILS' ? priceILS : priceUSD;

  // `==` here is intentional — Sanity returns `null` for empty number
  // fields, but TypeScript's `?:` only models `undefined`. Catch both.
  if (price == null) {
    return (
      <span className="font-display font-semibold text-2xl text-slate">
        {t('painting.inquireForPrice')}
      </span>
    );
  }

  return (
    <span className="font-display font-black text-4xl text-ink">
      {formatPrice(price, currency)}
    </span>
  );
}
