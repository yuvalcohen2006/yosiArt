import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export type Currency = 'USD' | 'ILS';

const STORAGE_KEY = 'yosiart.currency';

const subscribers = new Set<(c: Currency) => void>();

/** An explicit choice, or null if the visitor has never picked one. */
function stored(): Currency | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'USD' || v === 'ILS' ? v : null;
}

/** Prices are set in shekels, so a Hebrew visitor sees the real figure and an
 *  English one sees the converted one — each starts in the currency they are
 *  most likely to be thinking in. */
function localeDefault(): Currency {
  return (i18n.resolvedLanguage ?? 'he').startsWith('he') ? 'ILS' : 'USD';
}

function read(): Currency {
  return stored() ?? localeDefault();
}

// Switching language re-picks the default, but only for a visitor who has
// never touched the toggle. An explicit choice always outranks the locale.
if (typeof window !== 'undefined') {
  i18n.on('languageChanged', () => {
    if (stored()) return;
    const next = localeDefault();
    subscribers.forEach((cb) => cb(next));
  });
}

/**
 * Tiny pub-sub currency store. No React Context — every consumer reads the same
 * in-memory value and re-renders when `setCurrency` fires. Persisted to
 * localStorage so the choice survives reloads. Same shape as `useUnit`.
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
