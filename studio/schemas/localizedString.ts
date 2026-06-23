import { defineType, defineField } from 'sanity';

/**
 * Bilingual short string. Renders side-by-side English and Hebrew inputs
 * in the studio. At least one language must be filled.
 */
export default defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string' }),
    defineField({ name: 'he', title: 'Hebrew', type: 'string' }),
  ],
  validation: (Rule) =>
    Rule.custom((value: { en?: string; he?: string } | undefined) => {
      if (!value?.en && !value?.he) {
        return 'At least one language is required';
      }
      return true;
    }),
});
