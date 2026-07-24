/*
  GROQ queries. Centralized so the same query isn't duplicated across pages
  and so we can keep an eye on what we're asking the CDN for.

  Pattern: select only the fields we need (don't dump the whole doc), and
  flatten reference fields with the `category->{ ... }` join so the
  frontend types match `Painting` in `./types.ts` without any extra hops.
*/

export const CATEGORIES_QUERY = /* groq */ `
  *[_type == "category"] | order(order asc, title.en asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    order,
    coverImage,
    "count": count(*[_type == "painting" && references(^._id)])
  }
`;

export const PAINTINGS_QUERY = /* groq */ `
  *[_type == "painting"] | order(priority asc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    "category": category->{
      title,
      "slug": slug.current
    },
    description,
    year,
    medium,
    dimensions,
    priceILS,
    priceUSD,
    status,
    priority,
    previewImage,
    images
  }
`;

export const HOME_MEDIA_QUERY = /* groq */ `
  *[_type == "homeMedia"][0] {
    heroImages,
    ogImage
  }
`;

export const PAINTINGS_BY_CATEGORY_QUERY = /* groq */ `
  *[_type == "painting" && category->slug.current == $categorySlug] | order(priority asc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    previewImage,
    images,
    priceILS,
    priceUSD,
    status,
    priority
  }
`;

export const PAINTING_BY_SLUG_QUERY = /* groq */ `
  *[_type == "painting" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    "category": category->{ title, "slug": slug.current },
    description,
    year,
    medium,
    surface,
    dimensions,
    priceILS,
    priceUSD,
    status,
    previewImage,
    images
  }
`;

export const RELATED_PAINTINGS_QUERY = /* groq */ `
  *[_type == "painting"
    && category->slug.current == $categorySlug
    && slug.current != $slug
  ] | order(priority asc, _createdAt desc) [0...12] {
    _id,
    title,
    "slug": slug.current,
    "category": category->{ title, "slug": slug.current },
    previewImage,
    images,
    priceILS,
    priceUSD,
    status,
    priority
  }
`;

export const SITE_SETTINGS_QUERY = /* groq */ `
  *[_type == "siteSettings"][0] {
    brandName,
    tagline,
    artistBio,
    artistPhoto,
    contact,
    social,
    studioAddress
  }
`;
