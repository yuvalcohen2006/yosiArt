# Design System — Foundations (Direction C: Editorial Storytelling · RTL Hebrew)

Frontend-only. RTL-native from the ground up. Built to drop into the existing
Tailwind setup (`tailwind.config.ts` + `src/index.css`).

## 1. Principles
1. **Oversized Hebrew type is the hero** — headlines are graphic elements, not labels.
2. **Asymmetric editorial grid** — 12-col, intentional whitespace, off-center anchors.
3. **Scroll-driven narrative** — staggered reveals, sticky chapter beats, restrained parallax.
4. **The art carries the colour** — UI stays quiet so paintings pop.
5. **RTL is the default, never an afterthought** — reading flows right→left everywhere.

## 2. Colour tokens  ⟶ ✅ **LOCKED: Deep-Sea Editorial (light canvas)**

### ✅ LOCKED — "Deep-Sea Editorial (light canvas)"
Carries forward the deep-sea palette you liked, on a calm editorial canvas.
| Token | Hex | Use |
|---|---|---|
| `paper` | `#F3F3F0` | page canvas (warm off-white) |
| `ink` | `#0D1B2A` | headlines + body (deep navy, ~15:1) |
| `slate` | `#3C5168` | secondary text (~6.5:1) |
| `accent` | `#2F5D74` | links/hover/marks (deep-sea blue, text-safe) |
| `line` | `#D8DAD7` | rules / hairlines (decorative) |
| `mist` | `#E6E7E3` | card backings / skeletons |
| `sea-900…100` | `#0D1B2A → #E0E1DD` | scale for accents, dark sections, the hero |

A **dark "chapter"** (e.g. hero or one storytelling section) uses `sea-900` ground + `sea-100` text — so we get editorial drama without going dark site-wide.

### Alt 1 — "Gallery Ink" (pure editorial)
Warm cream `#F5F4EF` · near-black ink `#15171A` · single oxblood accent `#7C2D2D` (à la Karl Richter / Vogue). Boldest, most magazine-like.

### Alt 2 — "Dark Editorial" (full dark)
`sea-900` canvas throughout, `sea-100` text, accent `#778DA9`. Most cinematic; heaviest a11y burden.

## 3. Typography  ⟶ ✅ **LOCKED: Secular One (titles) + Alef (body)**

### ✅ LOCKED
- **Display / headlines: `Secular One`** (Google Fonts, weight 400 — heavy poster
  display Hebrew). Bold graphic presence for oversized editorial titles.
  *(Noto Rashi Hebrew was tried and dropped — too stylized.)*
- **Body / UI: `Alef`** (humanist Hebrew sans, very readable; 400/700).
- Both subset Hebrew + Latin; Latin fallback in-family.

> Secular One is single-weight (400) but visually heavy — perfect for big headlines.
> For mid-weight headings use Alef 700, or layer size/colour for hierarchy.

### Type scale (fluid, oversized for editorial)
| Role | Size (clamp) | Font / weight | Notes |
|---|---|---|---|
| Hero display | `clamp(3rem, 11vw, 10rem)` | display 700–900, `leading-[0.95]` | one Hebrew line, graphic |
| Page title (h1) | `clamp(2.5rem, 7vw, 6rem)` | display 700 | `tracking-tight` |
| Section (h2) | `clamp(1.75rem, 4vw, 3.25rem)` | display 600–700 | |
| Sub (h3) | `1.375–1.75rem` | display/sans 600 | |
| Eyebrow/label | `0.8125rem` | sans 500, `tracking-[0.18em]` | small-caps feel |
| Body | `1.0625–1.1875rem` | sans 400, `leading-[1.8]` | Hebrew likes generous leading |
| Meta/small | `0.8125rem` | sans 400/500 | prices/dims stay `dir="ltr"` |

## 4. Spacing & grid
- Base unit **4px**; rhythm scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
- Section vertical rhythm: `py-20 → md:py-32` (editorial breathing room).
- Container: `max-w-7xl` + responsive inline gutters `px-6 md:px-12 lg:px-16` (logical → mirrors in RTL).
- Editorial grid: **12-col**; content blocks anchor off-center (e.g. `col-start` to push a column toward the inline-start/right in RTL).

## 5. RTL rules (non-negotiable)
- `<html dir="rtl" lang="he">` (already wired) — Hebrew is default; English mirrors back to LTR.
- **Use logical utilities**: `ps-/pe-`, `ms-/me-`, `text-start/end`, `start-/end-`,
  `border-s/e` — NOT hard `left/right`. Reserve `rtl:`/`ltr:` variants for true mirroring.
- **Carousels scroll RTL**: first item at the inline-start (right); drag/scroll flows
  right→left. (Internally we may pin `dir="ltr"` on the scroller for stable `scrollLeft`
  math, then mirror the visual order — document per-component.)
- **Mirror directional icons**: arrows/chevrons `rtl:rotate-180` or `rtl:-scale-x-100`.
- **Keep LTR runs isolated**: prices, dimensions, dates, emails, `@handles`, phone →
  `dir="ltr"` + `unicode-bidi:isolate` so digits/symbols don't reorder.
- Numerals: Western digits, isolated; never let a numeric marker (e.g. "01 —") fling
  to the opposite edge.

## 6. Accessibility baseline (carried to Phase 5)
Contrast ≥4.5:1 body / ≥3:1 large+UI · visible focus rings · `prefers-reduced-motion`
respected (parallax/scroll effects gated) · no emoji icons · cursor-pointer on
clickables · responsive 375/768/1024/1440 · no horizontal scroll on mobile.
