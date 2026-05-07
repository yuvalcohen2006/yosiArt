import { Head } from 'vite-react-ssg';

const SITE_NAME = 'YosiArt';
const SITE_TAGLINE = 'Acrylic on canvas';
const SITE_BASE_URL = 'https://yosiart.vercel.app';
const DEFAULT_DESCRIPTION =
  'Original acrylic paintings by Yosi Cohen. Rabbis, Exodus, Retro, Movies, and one-of-a-kind originals.';

type Props = {
  /** Page title — gets suffixed with " · YosiArt" automatically. Pass
   *  `null` (or omit) on Home to use the brand-only title. */
  title?: string | null;
  /** Short page description (~160 chars). Falls back to the site default. */
  description?: string;
  /** Path of the current page, e.g. "/works" or "/work/exodus-splitting-the-sea".
   *  Used to build the canonical URL + og:url. */
  path: string;
  /** Absolute URL of the OG / twitter image (1200×630 recommended). When
   *  omitted the page renders without an `og:image` tag (link previews
   *  will show a text-only card). The home page and painting pages
   *  always pass one — set the home OG via the `homeMedia.ogImage`
   *  field in Sanity. */
  image?: string;
  /** OpenGraph type. "article" for paintings, otherwise "website". */
  type?: 'website' | 'article';
  /** JSON-LD structured-data block — a parsed object that gets stringified
   *  into a `<script type="application/ld+json">` tag. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Per-page meta-tag block. Renders title, description, OG, twitter, canonical
 * link, and (optionally) JSON-LD into the document head via vite-react-ssg's
 * `<Head>` (a thin wrapper around react-helmet-async).
 *
 * One canonical URL per route — we always pre-render the English version,
 * and the client-side i18n switcher takes over after hydration to flip the
 * UI language. This keeps the SEO story simple: crawlers index a single
 * canonical URL per painting, the user can still toggle languages once the
 * page loads.
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = 'website',
  jsonLd,
}: Props) {
  const fullTitle = title
    ? `${title} · ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const url = `${SITE_BASE_URL}${path}`;
  const jsonLdString = jsonLd
    ? JSON.stringify(jsonLd)
    : null;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* OpenGraph — used by WhatsApp / Slack / FB / IG / iMessage etc.
          for the rich preview card when someone pastes the URL. */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:width" content="1200" />}
      {image && <meta property="og:image:height" content="630" />}

      {/* Twitter card — separate spec but same data; both are needed
          for full coverage across platforms. */}
      <meta
        name="twitter:card"
        content={image ? 'summary_large_image' : 'summary'}
      />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD structured data — invisible markup that tells search
          engines what kind of thing this page is (e.g. a painting). */}
      {jsonLdString && (
        <script type="application/ld+json">{jsonLdString}</script>
      )}
    </Head>
  );
}

/** Site-wide constants exported for tests / sitemap generation. */
export { SITE_BASE_URL, SITE_NAME, DEFAULT_DESCRIPTION };
