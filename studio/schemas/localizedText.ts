import { defineType, defineField } from 'sanity';

/**
 * Bilingual multi-line text (no rich formatting). Used for short
 * descriptions, alt text, and similar.
 */
export default defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'he',
      title: 'Hebrew',
      type: 'text',
      rows: 3,
    }),
  ],
});
