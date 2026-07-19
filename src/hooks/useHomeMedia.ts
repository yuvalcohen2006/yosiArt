import { useEffect, useState } from 'react';
import { sanityClient } from '@/sanity/client';
import { HOME_MEDIA_QUERY } from '@/sanity/queries';
import type { HomeMedia } from '@/sanity/types';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: HomeMedia | null }
  | { status: 'error'; error: unknown };

/**
 * Fetches the singleton `homeMedia` document (hero images + OG image).
 *
 * The landing page gets this from its route loader, which is better for LCP.
 * This hook exists for the SHARED navbar, which is rendered by Layout on every
 * other route and so has no access to `/`'s loader data — React Router scopes
 * loader data per route, and Layout is the parent. Without it the Works
 * dropdown's featured tile fell back to a flat gradient everywhere except the
 * landing page.
 *
 * `enabled` lets the landing page skip the request entirely, since it already
 * has the data and doesn't render this navbar anyway.
 *
 * Layout is the root element and stays mounted across client-side navigation,
 * so this fires once per page load, not once per navigation. Repeats within a
 * session are served from the browser HTTP cache (the client runs `useCdn`).
 */
export function useHomeMedia(enabled = true) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    sanityClient
      .fetch<HomeMedia | null>(HOME_MEDIA_QUERY)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data: data ?? null });
      })
      .catch((error) => {
        if (!cancelled) {
          // Surface fetch failures during dev — silent failures are the
          // worst class of bug.
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.error('[Sanity] homeMedia fetch failed:', error);
          }
          setState({ status: 'error', error });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
