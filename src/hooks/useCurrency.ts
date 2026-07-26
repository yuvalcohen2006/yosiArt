import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export type Currency = 'USD' | 'ILS';

/** Prices are set in shekels, so a Hebrew visitor sees the real figure and an
 *  English one sees the converted one — each reads the price in the currency
 *  they are already thinking in. */
function localeDefault(): Currency {
  return (i18n.resolvedLanguage ?? 'he').startsWith('he') ? 'ILS' : 'USD';
}

/**
 * Which currency to price in — derived purely from the visitor's language.
 *
 * There was once a ₪/$ switch beside the price, a stored preference behind it,
 * and a pub-sub store to keep the two in step. All of it is gone. The switch
 * offered a choice where each reader only ever has one right answer, and a
 * saved preference that outlives its control is worse than no preference at
 * all: a visitor who had once picked ₪ while reading in English would be pinned
 * to shekels permanently, with nothing left on the page to undo it. The old
 * `yosiart.currency` key is therefore deliberately NOT read — whatever sits in
 * it belongs to a control that no longer exists.
 *
 * With nothing left to write, the store collapses to a derived value: language
 * in, currency out. (`useUnit` still has its cm/in toggle, so it keeps the
 * pub-sub shape this used to share with it.)
 */
export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>(localeDefault);

  useEffect(() => {
    const sync = () => setCurrency(localeDefault());
    // Called once up front as well as on change: the prerendered HTML was built
    // with i18n's initial language, and the browser's detector can have settled
    // on a different one before this effect runs. Doing it here rather than
    // during render is what keeps hydration from mismatching.
    sync();
    i18n.on('languageChanged', sync);
    return () => {
      i18n.off('languageChanged', sync);
    };
  }, []);

  return { currency };
}
