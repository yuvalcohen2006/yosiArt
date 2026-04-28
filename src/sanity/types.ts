/*
  TypeScript shapes that mirror the Sanity schemas in studio/schemas/.
  Keep these in sync when schema fields change.
*/

export type LocalizedString = { en?: string; he?: string };
export type LocalizedText = { en?: string; he?: string };

export type SanityImage = {
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
  description?: LocalizedText;
  year?: number;
  medium?: LocalizedString;
  dimensions?: { widthCm?: number; heightCm?: number };
  priceILS?: number;
  priceUSD?: number;
  status: PaintingStatus;
  featured?: boolean;
  images: SanityImage[];
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
  ogDefault?: SanityImage;
};
