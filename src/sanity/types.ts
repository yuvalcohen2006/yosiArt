/*
  TypeScript shapes that mirror the Sanity schemas in studio/schemas/.
  Keep these in sync when schema fields change.
*/

export type LocalizedString = { en?: string; he?: string };
export type LocalizedText = { en?: string; he?: string };

export type SanityImage = {
  /** Stable key Sanity adds to array members. Undefined for standalone
   *  image fields (siteSettings.artistPhoto, painting.previewImage). */
  _key?: string;
  _type?: 'image';
  asset: { _ref: string; _type: 'reference' };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
  altHe?: string;
};

export type Category = {
  _id: string;
  title: LocalizedString;
  slug: string;
  description?: LocalizedText;
  order?: number;
  coverImage?: SanityImage;
};

export type PaintingStatus = 'available' | 'sold' | 'reserved';

export type Painting = {
  _id: string;
  title: LocalizedString;
  slug: string;
  /** GROQ-resolved category title — populated by joins in queries.ts. */
  category?: { title: LocalizedString; slug: string };
  description?: LocalizedText | null;
  year?: number | null;
  medium?: LocalizedString | null;
  dimensions?: { widthCm?: number | null; heightCm?: number | null } | null;
  // Sanity returns `null` (not `undefined`) for empty number fields, so
  // models that talk to the CDN need to admit `null` explicitly.
  priceILS?: number | null;
  priceUSD?: number | null;
  status: PaintingStatus;
  /** Tight crop for grid cards. Falls back to `images[0]` when not set. */
  previewImage?: SanityImage | null;
  /** Pre-composed 1200×630 share-card image. Served as-is to OG link
   *  bots when set; falls back to a letterboxed `previewImage` /
   *  `images[0]` when unset. */
  ogImage?: SanityImage | null;
  images: SanityImage[];
};

/**
 * `homeMedia` singleton — controls the visuals on the home page that
 * aren't paintings: the cycling hero carousel images, and the OG image
 * used when the bare site URL is shared on WhatsApp / IG.
 */
export type HomeMedia = {
  heroImages?: SanityImage[] | null;
  ogImage?: SanityImage | null;
};

/** Portable Text shape — kept loose until we render rich text in M11. */
type PortableTextBlock = { _type: string; [key: string]: unknown };

export type SiteSettings = {
  brandName?: LocalizedString;
  tagline?: LocalizedString;
  artistBio?: { en?: PortableTextBlock[]; he?: PortableTextBlock[] };
  artistPhoto?: SanityImage;
  contact?: {
    email?: string;
    whatsapp?: string;
    paypalMerchantEmail?: string;
  };
  social?: { instagram?: string; facebook?: string };
  studioAddress?: LocalizedText;
};
