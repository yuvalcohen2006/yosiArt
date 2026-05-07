/**
 * Single source of truth for Yosi's contact details. Used by the Contact
 * page, the Footer, and the painting-detail Inquire buttons.
 *
 * M11 will swap this for a Sanity-driven `siteSettings.contact` so dad
 * can edit them himself; until then these constants are the canonical
 * values and any UI that needs them imports from here.
 */

/** WhatsApp number in international format, no `+` or spaces — the form
 *  `wa.me` deep links expect. */
export const WHATSAPP_NUMBER = '972545241828';

/** Display version of the number — pretty-formatted for the Contact
 *  page and Footer. */
export const WHATSAPP_DISPLAY = '+972 54-524-1828';

/** Yosi's contact email. */
export const EMAIL = 'Yosicohen164@gmail.com';

/** Public Instagram URL + handle. */
export const INSTAGRAM_URL = 'https://www.instagram.com/_cohen_art';
export const INSTAGRAM_HANDLE = '@_cohen_art';
