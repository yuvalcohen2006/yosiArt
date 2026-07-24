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
 * The full catalogue, fetched at most once per page load.
 *
 * Shared as a promise rather than as data so that callers arriving while the
 * request is still in flight join it instead of starting a second one. The
 * image preloader asks for this the moment the site opens, and the Works page
 * asks for it again on navigation — without the cache that is the same
 * catalogue over the wire twice.
 */
let allPaintingsPromise: Promise<Painting[]> | null = null;

export function fetchAllPaintings(): Promise<Painting[]> {
  allPaintingsPromise ??= sanityClient
    .fetch<Painting[]>(PAINTINGS_QUERY)
    .then((data) => data ?? [])
    .catch((error) => {
      // Never cache a rejection — the next caller should be free to retry.
      allPaintingsPromise = null;
      throw error;
    });
  return allPaintingsPromise;
}

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

    const request = categorySlug
      ? sanityClient.fetch<Painting[]>(PAINTINGS_BY_CATEGORY_QUERY, {
          categorySlug,
        })
      : fetchAllPaintings();

    request
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data: data ?? [] });
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
