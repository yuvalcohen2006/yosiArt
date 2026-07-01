# Design System — Component Inventory (RTL Editorial)

Each maps to existing components (restyle the view layer; keep data/routes intact).
Inline-start = **right** in RTL; inline-end = **left**.

## Navbar  → `components/layout/Header.tsx`
- Logo at inline-start (right). Nav links inline (editorial: small-caps Hebrew, animated
  underline or quiet pill). Language/currency toggles at inline-end (left).
- Sticky; shrinks on scroll. **Adapts over a dark chapter** (light-on-dark) → light otherwise.
- Mobile: inline-end hamburger → full overlay with oversized Hebrew links + index numerals.

## Hero  → `pages/HomeLanding.tsx` (+ `hero/AnimatedHeadline`)
- **Oversized Hebrew headline** as the centerpiece (display serif, one line, graphic scale).
- Asymmetric: headline anchored off-center; kicker (eyebrow) above; CTA below.
- Optional editorial backdrop (kept restrained — large type does the work; a single
  feature painting or a quiet motion layer, not a busy background).
- Scroll cue (mirrored). Reveal: per-character/word stagger.

## Painting carousel ("bodies of work")  → `components/home/CategoryCarousel.tsx`
- Horizontal strip; **scrolls RTL** (first card at the right, flows right→left).
- Cards: hard-edged editorial frames, caption below (Hebrew title + category), accent on hover.
- Auto-drift optional (pauses on interaction + `prefers-reduced-motion`). Mirrored edge fades.

## Category / works grid  → `components/gallery/PaintingGrid.tsx` + `PaintingCard.tsx`
- **Asymmetric editorial/masonry** grid; RTL flow (fills from the right). Feature pieces
  span columns for magazine rhythm.
- Card = image well (varied aspect) + caption block below (eyebrow category, title, sold mark).
- Filter bar (`CategoryFilter.tsx`): rule-separated small-caps Hebrew list, active = filled.

## Painting detail  → `components/painting/PaintingDetail.tsx`
- Editorial **two-column**: large image block + structured meta column (title, year/medium,
  dimensions w/ cm·in toggle, price, inquire). Baseline-aligned labels. Stacks on mobile.
- Breadcrumb (mirrored arrow). Lightbox preserved. Related strip below.
- Meta values that are numeric/Latin (price, dimensions) → `dir="ltr"` isolated.

## Footer  → `components/layout/Footer.tsx`
- Editorial: optional oversized Hebrew wordmark statement, then a baseline-ruled contact
  grid (email/WhatsApp/Instagram — values `dir="ltr"`), copyright row.

## Shared primitives  → `src/index.css`
- `.eyebrow` (small-caps Hebrew label), `.rule` (hairline), `.editorial-container`
  (max-width + logical gutters). Section **index numerals** ("01 ·") as a storytelling motif,
  bidi-isolated so they sit beside their label in RTL.

## Storytelling beats (new for Direction C)
- **Chapter sections** with sticky mini-headings as you scroll the gallery/about.
- Optional **progress indicator** (thin, inline-end) for the narrative scroll.
- A single **dark editorial chapter** (sea-900) for contrast/drama, fading back to paper.
