# Discovery notes — UI/UX Pro Max (art/painting portfolio)

Pulled via the UI/UX Pro Max skill to frame what to hunt for in Phase 1.

## Recommended pattern — "Portfolio Grid"
- Section order: **1. Hero (name/role) → 2. Project grid (masonry) → 3. About/philosophy → 4. Contact**
- CTA: project-card hover + footer contact
- Conversion: **visuals first**, filter by category, fast loading
- Color strategy: **neutral background, let the work shine**, minimal accent

## Alternative patterns worth referencing
- **Horizontal Scroll Journey** — intro (vertical) → horizontal track gallery → detail reveal → vertical footer. Immersive; keep nav visible. (RTL note: horizontal track must scroll right-to-left.)
- **Scroll-Triggered Storytelling** — chaptered narrative, progressive color, progress indicator; +time-on-page.

## Style direction — "Motion-Driven"
- Animation-led: scroll reveals (IntersectionObserver), hover 300–400ms, entrance, parallax (3–5 layers), page transitions
- Must respect `prefers-reduced-motion`
- Pairs with a neutral gallery palette so motion + art carry the page

## Typography (Hebrew)
- Skill suggests **Noto Sans Hebrew**; we currently have **Heebo (titles) + Alef (body)** locked. Decide in Phase 2.

## Palette reference (skill: Museum/Gallery)
- Gallery black `#18181B` / near-black `#09090B` on off-white `#FAFAFA`, minimal accent.
- Our current direction = **deep-sea** (`#0d1b2a … #e0e1dd`). We'll reconcile the locked inspiration direction against this in Phase 2.

## What to collect in Phase 1 (Pinterest)
- **UX refs:** nav patterns, gallery/masonry layouts, category filtering, painting-detail pages, footer/contact, horizontal vs vertical flow.
- **UI refs:** type treatment (large editorial Hebrew-friendly), color/neutral palettes, spacing/whitespace, hover/motion, image framing.
- RTL lens on everything: mirror the layouts mentally; carousels scroll right-to-left.

## Pre-delivery checklist (carry into Phase 5)
No emoji icons · cursor-pointer on clickables · smooth hover 150–300ms · contrast ≥4.5:1 · visible focus · prefers-reduced-motion · responsive 375/768/1024/1440.
