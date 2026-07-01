# Fixed Palette — "Aurora" (locked)

Derived from the landing animation's three ribbons, tuned for cohesion + WCAG
contrast. This is the site's single source of truth for colour.

Tokens live in `tailwind.config.ts` (Tailwind classes) and `src/index.css`
`:root` (shadcn CSS-vars). Tweak there to retune globally.

## Core colours
| Role | Token | Hex | Notes |
|------|-------|-----|-------|
| **Primary (brand)** | `brand` | `#4863B8` | blue — main CTAs, key actions, active state (~5.3:1 on white) |
| Primary hover | `deep` | `#3B539C` | darker blue (or `brand/90`) |
| **Secondary accent** | `teal` / `accent` | `#3C8FA0` | links + hover highlights, secondary buttons |
| Accent hover | — | `#347E8D` | `teal` darkened (or `accent/90`) |
| **Tertiary** | `indigo` | `#6E5FAE` | sparingly — accents, the 3rd ribbon |
| Text | `ink` | `#1C2333` | cool near-black — headings + body (~13:1) |
| Secondary text | `slate` | `#5A6478` | captions/meta (~5.6:1) |
| Base | `paper` | `#FFFFFF` | page background (white) |
| Surface | `mist` | `#EEF0F4` | cards / skeletons / faint fills |
| Border / rule | `line` | `#E5E8EF` | hairlines, dividers, input borders |

## Hover / state rules
- **Primary button** (e.g. a real CTA): `bg-brand text-white` → hover `bg-deep` (darker blue).
- **Secondary / outline button** (e.g. nav Sign In): `border-line text-ink` → hover `bg-accent text-white` (teal).
- **Nav links / ghost**: transparent → hover `bg-accent/10 text-accent` (subtle teal wash) or `text-brand`.
- **Text links**: `text-brand` → hover `text-deep` (or underline).
- **Focus ring**: `ring-brand` (matches `--ring`).
- **Active/selected**: `text-brand` + `bg-brand/10`.

## shadcn mapping (src/index.css :root)
`--primary`/`--ring` = periwinkle `#6750CC` (hover/active — see pastel palette below) ·
`--accent` (Tailwind hex) = teal · `--foreground` = ink · `--muted-foreground` = slate ·
`--border`/`--input` = line · `--background` = white.

## Landing pastel palette (current hero)
The landing animation uses a soft pastel ramp on a pure-white field:

| # | Hex | Tone |
|---|-----|------|
| 1 | `#ffd6ff` | pink |
| 2 | `#e7c6ff` | lilac |
| 3 | `#c8b6ff` | periwinkle-violet |
| 4 | `#b8c0ff` | periwinkle-blue |
| 5 | `#bbd0ff` | pale blue |

The lines tint white toward a colour that drifts across this ramp over space +
time (hard-coded in `shader-background.tsx` GLSL `palette()`).

**Hover / active colour:** these pastels are far too light for text on white, so
hover/active/focus use `#6750CC` (the ramp's periwinkle darkened to ~5.8:1, AA)
via `--primary`/`--ring`. Headlines + body stay `ink`.

## Frame radius (project standard)
**Every framed surface uses `rounded-md` = `0.375rem` (6px).** This is the
default for the search input and Sign-In button, and is the single rounding for
all frames going forward — inputs, buttons, cards, dropdown panels, image
frames, modals. No `--radius` override exists, so `rounded-md` resolves to the
Tailwind default. Use `rounded-md` (not `-sm`/`-lg`/`-xl`) on any new frame.

## The animation
The hero is `shader-background.tsx` (a plasma flow-field, pastel ramp above). The
earlier three-ribbon `web-gl-shader.tsx` is retained in the repo but unused.

## Status
✅ **Locked.** Apply these tokens as the site is rebuilt element-by-element.
Old deep-sea tokens (`sea-*`) are superseded; remove once no component references them.
