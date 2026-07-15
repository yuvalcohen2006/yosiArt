import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { sanityClient } from './client';

const builder = imageUrlBuilder(sanityClient);

/**
 * Build a Sanity CDN URL for an image asset. Chain helpers like:
 *   urlFor(image).width(800).auto('format').url()
 * Sanity returns optimized WebP automatically and respects the painting's
 * focal-point hotspot when cropping.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * One cropped, format-negotiated CDN URL per image — the shared card-image
 * policy for the hero coverflow and the category focus rail, so a future
 * tweak (quality, dpr, fit mode) lands in both at once.
 */
export function cardUrls(
  images: SanityImageSource[],
  width: number,
  height: number,
): string[] {
  return images.map((img) =>
    urlFor(img).width(width).height(height).fit('crop').auto('format').url(),
  );
}
