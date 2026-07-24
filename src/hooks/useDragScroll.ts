import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

/** Movement (px) before a press counts as a drag rather than a click. */
const DRAG_SLOP = 6;

/**
 * Grab-and-pull scrolling for a horizontally scrollable strip.
 *
 * Native `overflow-x-auto` already gives touch, trackpad and keyboard the right
 * behaviour; the one thing it withholds is letting a MOUSE user grab the strip
 * and pull. This adds exactly that and nothing else, so every other input keeps
 * working the way the browser intends. Touch is left alone deliberately —
 * hijacking it with pointer maths only ever makes a strip feel worse than the
 * platform's own inertial scrolling.
 *
 * Pointer capture is deliberately NOT used. These strips are built out of
 * links, and capturing would swallow the click that ends every press. Instead
 * the travelled distance is measured and the click is cancelled only once it
 * passes `DRAG_SLOP`, so a plain click still opens the painting while a real
 * pull never navigates by accident.
 *
 * `ref` is a CALLBACK ref, not a `useRef` object, and that is load-bearing.
 * These strips are populated from the CMS and typically mount after their
 * parent — a plain ref with an `[]`-dependency effect would measure while
 * `current` was still null, and `scrollable` would be stuck false forever. A
 * callback ref re-runs the measurement at the moment the node actually
 * attaches.
 */
export function useDragScroll<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((el: T | null) => setNode(el), []);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  // Whether the strip actually overflows. Without this the caller cannot tell a
  // draggable rail from a short one, and a short one still shows a grab cursor
  // and a "drag to explore" hint while `scrollLeft` has nowhere to go — which
  // reads to a visitor as a broken control rather than as a full row.
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    if (!node) return;
    // +1 absorbs sub-pixel rounding, which otherwise reports a flush row as
    // overflowing by a fraction of a pixel.
    const measure = () => setScrollable(node.scrollWidth > node.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    // Observe the track too: images settling changes content width without ever
    // resizing the scroll container itself.
    for (const child of Array.from(node.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [node]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<T>) => {
      // Left mouse button only: touch scrolls natively, and a right- or
      // middle-click press must not start pulling the rail.
      if (e.pointerType !== 'mouse' || e.button !== 0 || !node) return;
      drag.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        startScroll: node.scrollLeft,
      };
    },
    [node],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<T>) => {
      if (!node || !drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (!drag.current.moved && Math.abs(dx) < DRAG_SLOP) return;
      drag.current.moved = true;
      node.scrollLeft = drag.current.startScroll - dx;
    },
    [node],
  );

  const endDrag = useCallback(() => {
    drag.current.active = false;
  }, []);

  const onClickCapture = useCallback((e: ReactMouseEvent<T>) => {
    if (!drag.current.moved) return;
    // The press that just ended was a pull, not a tap — keep it off the link.
    e.preventDefault();
    e.stopPropagation();
    drag.current.moved = false;
  }, []);

  return {
    ref,
    scrollable,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onClickCapture,
    },
  };
}
