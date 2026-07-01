# Design System — Motion (Editorial Storytelling)

Grounded in UI/UX Pro Max guidance. **Every effect gates on `prefers-reduced-motion`.**

## Tokens
- **Durations:** micro 150–250ms · transitions 250–400ms · never >500ms for UI.
- **Easing:** `ease-out` entering, `ease-in` exiting; signature curve
  `cubic-bezier(0.22, 0.61, 0.36, 1)` (existing `ease-gallery`).
- **Stagger:** 30–50ms per item for list/grid reveals (cap total so late items aren't slow).

## Patterns
| Pattern | Where | Spec |
|---|---|---|
| Scroll reveal (fade-up) | sections, cards | IntersectionObserver / `useInView`, 1 trigger, ~24px rise, 300–400ms |
| Headline reveal | hero, page titles | per-word/char stagger; **renders final state instantly under reduced-motion** |
| Sticky chapter heading | gallery/about narrative | heading sticks while its section scrolls, releases at next |
| Subtle parallax | hero backdrop / feature image | small translate on scroll; **disabled under reduced-motion** (nausea risk — High) |
| Carousel auto-drift | painting strip | slow RTL drift; pauses on interaction + reduced-motion |
| Hover | cards, links, buttons | 200ms; scale ≤1.03 + brightness/colour; no layout shift |
| Page transition | route change | cross-fade (existing `AnimatedOutlet`) |
| Smooth anchor scroll | in-page nav | `html { scroll-behavior: smooth }` |
| Progress indicator | narrative scroll | thin bar/marks, inline-end; updates on scroll |

## Don'ts (from UX guidelines)
- No forced scroll-jacking; no infinite decorative animation; no linear easing for UI;
  no horizontal scroll leaking on mobile; always show loading skeletons (`animate-pulse`),
  never a frozen blank.

## RTL motion notes
- Directional motion follows reading order: enter from inline-start (right) for "forward".
- Carousel drift direction = right→left; mirrored edge-fade masks.
- Mirror any arrow/indicator that implies direction.
