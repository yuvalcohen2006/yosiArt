import { useEffect } from 'react';
import { fetchAllPaintings } from '@/hooks/usePaintings';
import { urlFor } from '@/sanity/imageUrl';
import type { SanityImage } from '@/sanity/types';

/**
 * Warms the browser cache with the gallery's card images shortly after the site
 * opens, so moving to the wall — or back to it — paints from cache instead of
 * waiting on the network.
 *
 * Deliberately conservative about when it runs and what it costs:
 *
 *  - It waits for the browser to go idle, so it never competes with the landing
 *    page's own hero and fonts for bandwidth.
 *  - It requests the SAME rendition the cards will ask for, chosen from the
 *    card's real srcSet candidates using the current viewport and DPR. Fetching
 *    a width the cards never request would warm nothing and cost everything.
 *  - It runs a small number at a time, at low priority.
 *  - It does nothing at all on a metered or 2G connection.
 *
 * Module-level `started` rather than component state: Layout stays mounted for
 * the session, but this guarantees the sweep cannot run twice even if it is
 * ever mounted somewhere else too.
 */

let started = false;

/** How many to warm. The catalogue is ~60 pieces; this is the whole wall. */
const MAX_IMAGES = 60;
/** Parallel requests. Low enough to stay out of the way of real navigation. */
const CONCURRENCY = 3;

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Respect metered and very slow connections — this is an optimisation, and an
 *  optimisation that burns someone's data allowance is a bug. */
function shouldSkip(): boolean {
  const conn = (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
}

/** The width the wall will actually request, given this viewport and DPR.
 *  Mirrors PaintingCard's srcSet candidates and `sizes`. */
function cardWidth(): number {
  const vw = window.innerWidth;
  const columns = vw < 768 ? 2 : vw < 1280 ? 3 : 4;
  // DPR capped at 2: past that the candidates stop growing anyway.
  const target = (vw / columns) * Math.min(window.devicePixelRatio || 1, 2);
  if (target <= 400) return 400;
  if (target <= 800) return 800;
  return 1200;
}

function preload(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    // Not typed on HTMLImageElement in this TS lib version, but honoured by
    // Chromium — keeps these behind anything the visitor actually asked for.
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'low';
    img.decoding = 'async';
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function schedule(cb: () => void): () => void {
  const w = window as typeof window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout: 4000 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 2000);
  return () => window.clearTimeout(id);
}

export function usePreloadGalleryImages() {
  useEffect(() => {
    if (started || typeof window === 'undefined') return;
    started = true;
    if (shouldSkip()) return;

    let cancelled = false;

    const cancelSchedule = schedule(() => {
      void (async () => {
        let paintings;
        try {
          paintings = await fetchAllPaintings();
        } catch {
          return; // The wall will report its own failure; this is best-effort.
        }
        if (cancelled) return;

        const width = cardWidth();
        const urls: string[] = [];
        for (const p of paintings.slice(0, MAX_IMAGES)) {
          const image: SanityImage | null | undefined =
            p.previewImage ?? p.images?.[0];
          if (!image) continue;
          urls.push(
            urlFor(image)
              .width(width)
              .height(Math.round(width * 1.25))
              .auto('format')
              .url(),
          );
        }

        let next = 0;
        const worker = async () => {
          while (!cancelled && next < urls.length) {
            await preload(urls[next++]);
          }
        };
        await Promise.all(Array.from({ length: CONCURRENCY }, worker));
      })();
    });

    return () => {
      cancelled = true;
      cancelSchedule();
    };
  }, []);
}
