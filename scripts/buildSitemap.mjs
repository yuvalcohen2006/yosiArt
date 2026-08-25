/**
 * Build-time sitemap.xml generator. Runs after `vite-react-ssg build`
 * (see the `build` script in package.json) — fetches every published
 * painting + category slug from Sanity, combines with the static page
 * routes, and writes `dist/sitemap.xml`.
 *
 * Search engines fetch this file at /sitemap.xml; we declare its
 * location in /robots.txt so crawlers find it without guessing.
 */
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const here = fileURLToPath(import.meta.url);
const root = resolve(here, '..', '..');
loadEnv({ path: resolve(root, '.env.local') });

// Keep in lockstep with SITE_BASE_URL in src/components/seo/SEO.tsx — the
// sitemap must advertise the same canonical domain the pages declare, or Google
// sees the sitemap URLs and the page canonicals disagree.
const SITE_BASE_URL = 'https://yosiart.com';
const PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID;
const DATASET = process.env.VITE_SANITY_DATASET ?? 'production';

if (!PROJECT_ID) {
  console.error('[sitemap] VITE_SANITY_PROJECT_ID is missing — skipping.');
  process.exit(0);
}

/**
 * Hit Sanity's public CDN endpoint with a GROQ query. We don't need the
 * `@sanity/client` SDK here — a plain fetch is enough and avoids dragging
 * the full library into a build script.
 */
async function groq(query) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${await res.text()}`);
  const { result } = await res.json();
  return result;
}

// Only painting slugs feed the sitemap now. Collections no longer have their
// own page — they're views of /works (via ?category=), so there's no separate
// URL to list.
const paintingSlugs = await groq(
  `*[_type == "painting" && defined(slug.current)].slug.current`,
);

const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/works', priority: '0.9', changefreq: 'weekly' },
  { loc: '/about', priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
  { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/accessibility', priority: '0.3', changefreq: 'yearly' },
  ...paintingSlugs.map((slug) => ({
    loc: `/work/${slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority, changefreq }) => `  <url>
    <loc>${SITE_BASE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const out = resolve(root, 'dist', 'sitemap.xml');
await writeFile(out, xml, 'utf8');

console.log(
  `[sitemap] wrote ${urls.length} URLs (${paintingSlugs.length} paintings) → ${out}`,
);
