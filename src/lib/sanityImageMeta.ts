import type { SanityImage } from '@/sanity/types';

/**
 * Parse the intrinsic pixel dimensions out of a Sanity image asset
 * reference. Sanity encodes the dimensions directly in the `_ref`
 * string: `image-{hash}-{width}x{height}-{format}`.
 *
 * Returning these so we can set `width`/`height` HTML attributes on
 * `<img>` tags — the browser uses them to reserve the correct
 * aspect-ratio'd space before the image bytes arrive, eliminating the
 * "text jumps when image loads" layout shift.
 */
export function getImageDims(
  image: SanityImage | undefined | null,
): { width: number; height: number } | null {
  const ref = image?.asset?._ref;
  if (!ref) return null;
  const match = ref.match(/-(\d+)x(\d+)-/);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}
