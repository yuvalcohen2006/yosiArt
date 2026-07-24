import { useEffect, useState } from 'react';

/**
 * Live ILS -> USD rate, fetched on demand.
 *
 * Every price in Sanity is entered in shekels; the dollar figure shown beside
 * it is a courtesy conversion, not a second price the artist maintains. So it
 * is fetched rather than stored, and it is always presented as approximate.
 *
 * Frankfurter is used because it needs no API key and sends CORS headers, so
 * the request works straight from the browser with nothing to leak or rotate.
 * It serves ECB reference rates, which move once per working day — precise
 * enough for "roughly this many dollars", and the reason an hour-long cache
 * costs nothing in accuracy.
 *
 * The hook is lazy on purpose: nothing is requested until `enabled` flips
 * true, which happens when a visitor asks to see a price. A gallery visitor who
 * never opens a price never causes a third-party request.
 *
 * The `api.frankfurter.dev` host is deliberate and must not be "tidied" back to
 * the shorter `api.frankfurter.app`. That host now answers with a 301 to this
 * one, and the redirect response carries no `Access-Control-Allow-Origin`. The
 * CORS spec re-checks every hop of a redirect chain, so the browser refuses to
 * follow it and the fetch fails before it ever reaches the working endpoint —
 * from curl it looks perfectly healthy, which is exactly what makes it a trap.
 */

const ENDPOINT = 'https://api.frankfurter.dev/v1/latest?base=ILS&symbols=USD';
const CACHE_KEY = 'yosiart.ilsUsdRate';
const TTL_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 6000;

export type RateState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; rate: number }
  | { status: 'error' };

type Cached = { rate: number; at: number };

/** Module-level memo so several PriceTags on one page share a single fetch. */
let inflight: Promise<number> | null = null;

function readCache(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (typeof parsed.rate !== 'number' || typeof parsed.at !== 'number') {
      return null;
    }
    if (Date.now() - parsed.at > TTL_MS) return null;
    return parsed.rate;
  } catch {
    // Private-mode sessionStorage throws on read; a missing cache is not an error.
    return null;
  }
}

function writeCache(rate: number) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ rate, at: Date.now() } satisfies Cached),
    );
  } catch {
    // Storage full or blocked — the rate still works for this render.
  }
}

async function fetchRate(): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, { signal: controller.signal });
    if (!res.ok) throw new Error(`rate request failed: ${res.status}`);
    const body: unknown = await res.json();
    const rate = (body as { rates?: { USD?: unknown } })?.rates?.USD;
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new Error('rate response missing a usable USD figure');
    }
    writeCache(rate);
    return rate;
  } finally {
    clearTimeout(timer);
  }
}

export function useIlsToUsdRate(enabled: boolean): {
  state: RateState;
  retry: () => void;
} {
  const [state, setState] = useState<RateState>({ status: 'idle' });
  // Bumping this re-runs the effect. A plain "toggle enabled off and on again"
  // retry does not work: both updates batch into one render, `enabled` never
  // changes value, and the effect is never re-run.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const cached = readCache();
    if (cached != null) {
      setState({ status: 'success', rate: cached });
      return;
    }

    let alive = true;
    setState({ status: 'loading' });
    inflight = inflight ?? fetchRate();
    inflight
      .then((rate) => {
        if (alive) setState({ status: 'success', rate });
      })
      .catch(() => {
        if (alive) setState({ status: 'error' });
      })
      .finally(() => {
        inflight = null;
      });

    return () => {
      alive = false;
    };
  }, [enabled, attempt]);

  return { state, retry: () => setAttempt((a) => a + 1) };
}
