import { useEffect, useState } from 'react';
import { sanityClient } from '@/sanity/client';
import {
  PAINTING_BY_SLUG_QUERY,
  RELATED_PAINTINGS_QUERY,
} from '@/sanity/queries';
import type { Painting } from '@/sanity/types';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: Painting | null }
  | { status: 'error'; error: unknown };

/** Fetches a single painting by slug. Returns `data: null` if not found. */
export function usePainting(slug: string | undefined) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!slug) {
      setState({ status: 'success', data: null });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    sanityClient
      .fetch<Painting | null>(PAINTING_BY_SLUG_QUERY, { slug })
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error) => {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('[Sanity] painting fetch failed:', error);
          }
          setState({ status: 'error', error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}

type RelatedState =
  | { status: 'loading' }
  | { status: 'success'; data: Painting[] }
  | { status: 'error'; error: unknown };

/** Up to 4 other paintings in the same category, excluding this one. */
export function useRelatedPaintings(
  categorySlug: string | undefined,
  currentSlug: string | undefined,
) {
  const [state, setState] = useState<RelatedState>({ status: 'loading' });

  useEffect(() => {
    if (!categorySlug || !currentSlug) {
      setState({ status: 'success', data: [] });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    sanityClient
      .fetch<Painting[]>(RELATED_PAINTINGS_QUERY, {
        categorySlug,
        slug: currentSlug,
      })
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error) => {
        if (!cancelled) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('[Sanity] related paintings fetch failed:', error);
          }
          setState({ status: 'error', error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, currentSlug]);

  return state;
}
