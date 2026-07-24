import { useCallback, useRef } from 'react';
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
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  const onPointerDown = useCallback((e: ReactPointerEvent<T>) => {
    // Left mouse button only: touch scrolls natively, and a right-click or
    // middle-click press must not start pulling the rail.
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startScroll: el.scrollLeft,
    };
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(dx) < DRAG_SLOP) return;
    drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }, []);

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
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerLeave: endDrag,
      onClickCapture,
    },
  };
}
