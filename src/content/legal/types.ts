/**
 * Shape of a bilingual legal document (תקנון / מדיניות פרטיות / הצהרת נגישות).
 *
 * Body strings are lightweight rich text: paragraphs are separated by a
 * blank line ("\n\n") and lines beginning with "- " render as list items.
 * See `renderLegalBody` in src/pages/legal/LegalPage.tsx.
 */
export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalContent = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalDoc = {
  /** Human-readable "last updated" date, per language. */
  updated: { he: string; en: string };
  he: LegalContent;
  en: LegalContent;
};
