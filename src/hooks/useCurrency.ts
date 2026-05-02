import { useEffect, useState } from 'react';

export type Currency = 'USD' | 'ILS';

const STORAGE_KEY = 'yosiart.currency';
const DEFAULT_CURRENCY: Currency = 'USD';

const subscribers = new Set<(c: Currency) => void>();

function read(): Currency {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'USD' || v === 'ILS' ? v : DEFAULT_CURRENCY;
}

/**
 * Tiny pub-sub currency store. No React Context — every consumer reads
 * the same in-memory value and re-renders when `setCurrency` fires. We
 * persist to localStorage so the choice survives reloads.
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(read);

  useEffect(() => {
    const cb = (next: Currency) => setCurrencyState(next);
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  }, []);

  const setCurrency = (next: Currency) => {
    if (next === currency) return;
    localStorage.setItem(STORAGE_KEY, next);
    subscribers.forEach((cb) => cb(next));
  };

  return { currency, setCurrency };
}
