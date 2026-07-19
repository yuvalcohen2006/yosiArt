import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Wires up the keyboard and focus behaviour every dialog owes its users:
 *
 *  - focus moves into the panel when it opens, and returns to whatever opened
 *    it when it closes;
 *  - Tab and Shift+Tab cycle WITHIN the panel instead of walking off into the
 *    page behind it (a keyboard user who tabs out of an open dialog is
 *    stranded — the content they are tabbing through is visually covered);
 *  - Escape closes;
 *  - clicking outside closes;
 *  - optionally locks page scroll, for panels that overlay the whole page.
 *
 * WCAG 2.1.2 (No Keyboard Trap) is about not trapping people with no way out —
 * a cycle you can always leave with Escape is the expected pattern here, and
 * is what 2.4.3 (Focus Order) asks for.
 */
export function useDialog({
  open,
  onClose,
  panelRef,
  lockScroll = false,
}: {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLElement>;
  lockScroll?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Remember who opened this, so focus can go home afterwards.
    const opener = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Prefer the first real control; fall back to the panel itself.
    const first = focusables()[0];
    (first ?? panel).focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === firstItem || active === panel)) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && active === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!panel.contains(e.target as Node)) onClose();
    };

    // Whether focus is currently inside the panel, tracked LIVE rather than
    // probed at teardown. See the cleanup below for why that distinction
    // matters.
    let focusWasInside = true;
    const onFocusIn = (e: FocusEvent) => {
      focusWasInside = panel.contains(e.target as Node);
    };
    document.addEventListener('focusin', onFocusIn);

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onPointerDown);

    let previousOverflow = '';
    if (lockScroll) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      if (lockScroll) document.body.style.overflow = previousOverflow;
      // Send focus home — but only if the user hadn't already moved it out of
      // the panel themselves, where yanking it back would be the rude thing.
      //
      // This reads the tracked flag instead of asking
      // `panel.contains(document.activeElement)` here, which looks equivalent
      // and is not. For a conditionally rendered panel (`{open && <div/>}` —
      // how the accessibility widget renders), React commits the DOM removal
      // BEFORE running passive-effect cleanup. By this point the focused
      // element is detached and the browser has reset activeElement to
      // <body>, so the containment check was always false and focus was never
      // restored — it silently dropped to the top of the document on Escape.
      // The mounted-always drawer happened to work, which is what made the
      // bug easy to miss.
      if (opener && focusWasInside) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [open, onClose, panelRef, lockScroll]);
}
