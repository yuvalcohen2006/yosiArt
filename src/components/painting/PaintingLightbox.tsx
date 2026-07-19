import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { urlFor } from '@/sanity/imageUrl';
import { pickAlt } from '@/lib/pickAlt';
import { useLocale } from '@/hooks/useLocale';
import type { SanityImage } from '@/sanity/types';

type Props = {
  images: SanityImage[];
  open: boolean;
  index: number;
  onClose: () => void;
};

/**
 * Fullscreen pinch-zoom view. Lightbox handles keyboard nav (arrows, Esc),
 * touch gestures, and zoom out of the box. We just feed it Sanity-CDN URLs
 * sized for the largest reasonable display (2400 wide → fine even on 4K).
 */
export default function PaintingLightbox({
  images,
  open,
  index,
  onClose,
}: Props) {
  const { locale } = useLocale();
  // `pickAlt`, not `img.alt` — SanityImage carries both `alt` and `altHe`, and
  // reading the English one directly meant a Hebrew visitor got English alt
  // text, or nothing at all when only `altHe` had been filled in. That matters
  // most here of all places: in the fullscreen view the image is the only
  // content on screen. PaintingDetail and PaintingCard already do this; the
  // lightbox was the one that missed it.
  const slides = images.map((img) => ({
    src: urlFor(img).width(2400).auto('format').url(),
    alt: pickAlt(img, locale, ''),
  }));

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom]}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      controller={{ closeOnBackdropClick: true }}
      styles={{
        // Match the site's paper-cream backdrop instead of the default near-black.
        container: { backgroundColor: 'rgba(255, 255, 255, 0.96)' },
        icon: { color: '#1F1B16' },
      }}
    />
  );
}
