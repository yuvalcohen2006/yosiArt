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
