# Phase 1 — Inspiration Index (yosiArt)

Refs gathered via Playwright on Pinterest (logged in). Search terms were English
(for finding refs only) — **everything we design/build is RTL Hebrew**.
Screenshots are the reference boards saved alongside this file.

---

## Reference boards

### 01 — Art portfolio layouts (UX) → `01-ux-portfolio-layout.png`
General art/portfolio site structures. Why relevant: shows the range — editorial
hero + masonry, museum sites, oversized "PORTFOLIO" type, green/warm editorial
(Han), magazine grids. Borrow: hero→grid→about→contact flow, card hover, filter.

### 02 — Dark editorial / museum (UI) → `02-ui-dark-editorial-gallery.png`  ★
The strongest board for a painter. Caravaggio "About / Exhibition", **Doria
Pamphilj Gallery**, **Heritage In Art** (warm dark + serif italic), **Guy Bourdin
/ Vogue Paris** editorial, **Karl Richter Gallery** (dark + red accent), and a
clean **artwork detail page** (sculpture + "203 cm" dimensions). Borrow: near-black
canvas, large serif/display headlines, artwork glows, cinematic restraint.

### 03 — Museum site structures + detail pages (UX) → `03-ux-artwork-detail.png`  ★
Full museum IA: **Ozeum**, **Rijksmuseum**, **National Gallery (ng)** big-letter
editorial, **Mucha Museum**, "Art as Living Memory". Shows: exhibitions list,
collections grid, **visitor/meta info blocks**, artwork detail layout. Maps
directly to our `/works`, `/works/:category`, `/work/:slug`.

### 04 — Light minimal gallery (UI) → `04-ui-light-minimal-painter.png`
The calm, white-cube alternative. **Cereal** magazine minimalism, **Katie Hunter**
oversized monochrome type, **Adam Woranski** b/w grid, Sebastian Brooks. Borrow:
huge whitespace, tiny refined labels, restrained palette so the paintings carry all
colour. (Also surfaced a Hebrew RTL ad — confirms the look works right-to-left.)

---

## Three directions to choose from (each built RTL Hebrew, frontend-only)

### A — Dark Editorial Museum  ★ (closest to current build)
Near-black / deep-navy canvas, oversized display headlines, paintings spotlit and
glowing, exhibition-style sections, cinematic motion. Premium, dramatic, makes
colourful acrylics pop. Feeds from boards 02 + 03. Reuses our deep-sea palette +
WebGL hero.
- **Pros:** high impact, on-brand with what's built, art pops on dark.
- **Cons:** dark UIs need careful contrast/a11y; less "calm gallery".

### B — Light Minimal Gallery (white cube)
Bright off-white, massive whitespace, small editorial Hebrew labels, restrained
near-mono UI; the artwork supplies all the colour. Feeds from board 04 + parts of 01.
- **Pros:** timeless, calm, gallery-grade, easiest a11y/contrast.
- **Cons:** safer/less dramatic; leans on photography quality.

### C — Editorial Storytelling / Big-Type
Magazine-driven: oversized Hebrew type as a graphic element, asymmetric editorial
grids, scroll-triggered storytelling, strong typographic personality. Feeds from
boards 01 + 02 (Guy Bourdin/Vogue, National Gallery).
- **Pros:** most distinctive, strong identity, great for a Hebrew display face.
- **Cons:** most design-intensive; needs disciplined hierarchy to stay legible.

**My recommendation:** **A (Dark Editorial Museum)** as the spine, borrowing C's
oversized-Hebrew-type treatment for headlines — it builds on what's already there,
suits an Israeli painter's dramatic acrylics, and reads beautifully RTL. B stays on
the table if you want to pivot to a calmer white-cube feel.

---

## ✅ LOCKED DIRECTION (Phase 1 sign-off): **C — Editorial Storytelling**
Oversized Hebrew type as a graphic element, asymmetric editorial grids,
scroll-triggered narrative, strong typographic identity. Feeds primarily from
boards 01 + 02 (National Gallery big-type, Guy Bourdin/Vogue). Palette + fonts
decided in Phase 2.
