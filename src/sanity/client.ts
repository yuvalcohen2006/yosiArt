import { createClient } from '@sanity/client';

/**
 * Sanity content client. Reads from the public, CDN-cached endpoint —
 * safe to ship in the browser bundle (no secrets here, just a project id).
 *
 * useCdn: true — responses are cached at Sanity's edge (~30s freshness).
 * Perfect for a portfolio where the gallery doesn't change every minute.
 * Live edits trigger a Vercel rebuild (M13), so visitors see fresh data
 * within ~30s of dad publishing in the studio.
 */
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;

/**
 * When no project id is configured (e.g. a local design preview without a
 * `.env.local`), `createClient` would throw at import and take the whole
 * app down. Instead we fall back to a fail-soft stub whose `fetch` resolves
 * to `null` — every loader/hook then lands in its empty/fallback state and
 * the site stays browsable (just without live content). With a real project
 * id, this is the normal Sanity client.
 */
export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
      apiVersion: '2024-10-01',
      useCdn: true,
    })
  : ({
      fetch: async () => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            '[Sanity] VITE_SANITY_PROJECT_ID is not set — running with empty content. Add .env.local to load real data.',
          );
        }
        return null;
      },
    } as unknown as ReturnType<typeof createClient>);
