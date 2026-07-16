/**
 * Shared "levitation" interaction for the navbar controls: a small lift on
 * hover with a soft shadow, settling back down (faster) on click/press — so
 * the nav links, the Sign In button and the language switch all read as
 * clickable the same way.
 *
 * Kept as a plain string constant (scanned by Tailwind here) so it can be
 * appended to a cva base and to individual className lists alike.
 */
export const NAV_LIFT =
  'transition-[transform,filter,color] duration-200 ease-out ' +
  'hover:-translate-y-[3px] hover:drop-shadow-[0_7px_10px_rgba(28,35,51,0.18)] ' +
  'active:translate-y-0 active:drop-shadow-none active:duration-100';
