import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { ChevronLeft, ChevronRight, Loader2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { urlFor } from '@/sanity/imageUrl';
import { pickAlt } from '@/lib/pickAlt';
import { getImageDims } from '@/lib/sanityImageMeta';
import { useLocale } from '@/hooks/useLocale';
import type { SanityImage } from '@/sanity/types';

type Props = {
  images: SanityImage[];
  open: boolean;
  index: number;
  onClose: () => void;
};

/** The widths offered to the browser, smallest first. 1400 is deliberate: the
 *  detail page's hero renders at that width, so on a desktop viewport the
 *  lightbox's first choice is usually already in cache and paints instantly
 *  instead of pulling a fresh 2400px file over the wire. */
const WIDTHS = [700, 1400, 2000, 2400];

/** Icon buttons share one look — the library's defaults are small, low
 *  contrast, and a different visual language from the rest of the site. */
const ICON_CLASS = 'h-6 w-6';

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
  // content on screen.
  const slides = images.map((img) => {
    const dims = getImageDims(img);
    const ratio = dims ? dims.height / dims.width : 1;
    return {
      src: urlFor(img).width(2400).auto('format').url(),
      alt: pickAlt(img, locale, ''),
      width: dims?.width,
      height: dims?.height,
      // Without this the lightbox always fetches the single 2400px `src`,
      // which is why opening it felt slow even on a fast connection.
      srcSet: WIDTHS.map((w) => ({
        src: urlFor(img).width(w).auto('format').url(),
        width: w,
        height: Math.round(w * ratio),
      })),
    };
  });

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      plugins={[Zoom]}
      zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
      controller={{ closeOnBackdropClick: true }}
      animation={{ fade: 200, swipe: 300 }}
      render={{
        iconClose: () => <X aria-hidden className={ICON_CLASS} />,
        iconZoomIn: () => <ZoomIn aria-hidden className={ICON_CLASS} />,
        iconZoomOut: () => <ZoomOut aria-hidden className={ICON_CLASS} />,
        iconPrev: () => <ChevronLeft aria-hidden className={ICON_CLASS} />,
        iconNext: () => <ChevronRight aria-hidden className={ICON_CLASS} />,
        iconLoading: () => (
          <Loader2 aria-hidden className="h-8 w-8 animate-spin text-ink/40" />
        ),
      }}
      styles={{
        // Match the site's paper-cream backdrop instead of the default near-black.
        container: { backgroundColor: 'rgba(255, 252, 242, 0.97)' },
        // Ink on cream, on a soft plate so the controls stay findable over a
        // pale painting without shouting over it.
        button: {
          color: '#403d39',
          filter: 'none',
          background: 'rgba(255, 252, 242, 0.75)',
          borderRadius: '6px',
          padding: '8px',
          margin: '6px',
        },
      }}
    />
  );
}
