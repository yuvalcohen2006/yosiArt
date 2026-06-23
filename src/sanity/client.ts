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
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
  apiVersion: '2024-10-01',
  useCdn: true,
});
