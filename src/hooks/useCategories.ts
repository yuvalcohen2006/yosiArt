import { useEffect, useState } from 'react';
import { sanityClient } from '@/sanity/client';
import { CATEGORIES_QUERY } from '@/sanity/queries';
import type { Category } from '@/sanity/types';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: Category[] }
  | { status: 'error'; error: unknown };

/**
 * Fetches all categories from Sanity, ordered by `order` then English title.
 * Returns a typed state machine so callers can render skeletons / fallbacks
 * cleanly. Throws are converted to an `error` state — never thrown.
 */
export function useCategories() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    sanityClient
      .fetch<Category[]>(CATEGORIES_QUERY)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
