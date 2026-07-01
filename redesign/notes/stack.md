# yosiArt — Stack Report (pre-Phase 1)

Detected from the repo (package.json, configs, source). This is what we're restyling.

## Framework & build
- **React 18.3** + **TypeScript 5.6** (strict, `verbatimModuleSyntax`, `noUnusedLocals`)
- **Vite 5.4** + **vite-react-ssg 0.9 (beta)** — static pre-render at build (`tsc -b && vite-react-ssg build && buildSitemap.mjs`)
- Path alias `@/*` → `src/*` (vite + tsconfig)

## Styling
- **Tailwind CSS 3.4** + PostCSS + Autoprefixer — the single styling system
- Tokens in `tailwind.config.ts` (current: deep-sea palette `sea-900…sea-100` + semantic `paper/ink/accent/…`)
- Global CSS + primitives in `src/index.css` (`.eyebrow`, `.rule`, `.editorial-container`)
- `cn()` helper (`clsx` + `tailwind-merge`) at `src/lib/utils.ts`

## Routing & views
- **react-router-dom 6.30** via vite-react-ssg `RouteRecord` (`src/routes.tsx`)
- Routes (PRESERVE ALL): `/` (HomeLanding), `/works`, `/works/:category`, `/work/:slug`, `/about`, `/contact`, `*` (404)
- Layout shell: `src/components/layout/Layout.tsx` (Header, AnimatedOutlet, Footer)

## i18n / RTL (already wired — we build on this)
- **i18next + react-i18next** — `he` + `en`, **Hebrew default**, browser language respected
- `<html lang dir>` synced on locale change; `he` → `dir="rtl"`
- Strings in `src/i18n/he.json` + `en.json`
- Fonts: **Heebo** (titles) + **Alef** (body) — locked earlier. *(UI/UX Pro Max also suggests Noto Sans Hebrew; we keep Heebo+Alef unless you change it in Phase 2.)*

## Data layer (BACKEND — DO NOT TOUCH)
- **Sanity CMS** (`@sanity/client`, `@sanity/image-url`) — `src/sanity/` (client, queries, types, imageUrl)
- Content: paintings, categories, homeMedia, siteSettings (live project `z7u0jx0m`)
- Build-time loaders + client hooks (`usePaintings`, `useCategories`, `usePainting`)
- Fail-soft client (empty content if no project id)
- **These are the data contracts to preserve.** Restyle the view layer only.

## Motion & media
- **framer-motion 12** (Reveal, AnimatedHeadline, AnimatedOutlet, carousel drift)
- **three 0.184** — WebGL deep-sea hero shader (lazy-loaded, `/` only)
- **yet-another-react-lightbox** — painting detail zoom

## Frontend-only boundary for this redesign
Touch: `src/components/**`, `src/pages/**`, `src/index.css`, `tailwind.config.ts`, `index.html`, `src/i18n/*.json` (copy only).
Do NOT touch: `src/sanity/**`, `src/routes.tsx` loaders/getStaticPaths, `studio/**`, `scripts/**`, `.env*`, build/server config, data contracts.
