import { defineType, defineField } from 'sanity';

/**
 * Bilingual rich text. Each language gets a Portable Text block array so
 * the artist bio (and similar long-form content) can have paragraphs,
 * emphasis, and links per language.
 */
export default defineType({
  name: 'localizedPortableText',
  title: 'Localized Rich Text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'he',
      title: 'Hebrew',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
});
