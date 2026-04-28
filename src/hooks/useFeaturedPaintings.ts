import { useEffect, useState } from 'react';
import { sanityClient } from '@/sanity/client';
import { FEATURED_PAINTINGS_QUERY } from '@/sanity/queries';
import type { Painting } from '@/sanity/types';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: Painting[] }
  | { status: 'error'; error: unknown };

/** Featured paintings shown rotating in the hero carousel. Up to 8. */
export function useFeaturedPaintings() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    sanityClient
      .fetch<Painting[]>(FEATURED_PAINTINGS_QUERY)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error) => {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('[Sanity] featured paintings fetch failed:', error);
          }
          setState({ status: 'error', error });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
