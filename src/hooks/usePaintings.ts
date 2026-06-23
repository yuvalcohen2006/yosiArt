import { useEffect, useState } from 'react';
import { sanityClient } from '@/sanity/client';
import {
  PAINTINGS_BY_CATEGORY_QUERY,
  PAINTINGS_QUERY,
} from '@/sanity/queries';
import type { Painting } from '@/sanity/types';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: Painting[] }
  | { status: 'error'; error: unknown };

/**
 * Fetches paintings — all of them, or filtered to a single category if a
 * slug is given. The hook re-fetches whenever the slug changes, so a
 * single component can switch categories by passing a different prop.
 */
export function usePaintings(categorySlug?: string) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    const query = categorySlug ? PAINTINGS_BY_CATEGORY_QUERY : PAINTINGS_QUERY;
    const params = categorySlug ? { categorySlug } : {};

    sanityClient
      .fetch<Painting[]>(query, params)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error) => {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('[Sanity] paintings fetch failed:', error);
          }
          setState({ status: 'error', error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  return state;
}
