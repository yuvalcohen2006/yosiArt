import type { Currency } from '@/hooks/useCurrency';

/**
 * Format a price as "$1,200" / "₪1,200". Always symbol-prefix, always
 * comma thousand-separator, no decimals — keeps prices feeling clean
 * regardless of UI locale.
 */
export function formatPrice(amount: number, currency: Currency): string {
  const formatted = amount.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
  const symbol = currency === 'ILS' ? '₪' : '$';
  return `${symbol}${formatted}`;
}
