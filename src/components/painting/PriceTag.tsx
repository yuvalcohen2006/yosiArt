import { useCurrency } from '@/hooks/useCurrency';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/lib/formatPrice';
import type { PaintingStatus } from '@/sanity/types';

type Props = {
  priceILS?: number;
  priceUSD?: number;
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
      <span className="inline-flex items-center text-xs uppercase tracking-[0.176em] text-deep">
        <span className="mr-2 h-1 w-1 rounded-full bg-deep" />
        {t('painting.statusSold')}
      </span>
    );
  }

  const price = currency === 'ILS' ? priceILS : priceUSD;

  if (price === undefined) {
    return (
      <span className="font-display text-2xl text-ink/80">
        {t('painting.inquireForPrice')}
      </span>
    );
  }

  return (
    <span className="font-display text-3xl text-ink">
      {formatPrice(price, currency)}
    </span>
  );
}
