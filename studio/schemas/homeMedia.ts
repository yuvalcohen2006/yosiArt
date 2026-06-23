import { defineType, defineField } from 'sanity';

/**
 * Singleton — controls the visual content on the home page that isn't a
 * painting:
 *   - heroImages: the cycling images behind the hero headline
 *   - ogImage: the social-share preview card image used when someone
 *     pastes the bare site URL (yosiart.vercel.app) into WhatsApp / IG.
 *
 * Sits at the top of the studio desk under "Home media", and like
 * `siteSettings` it gets its create/duplicate/delete actions stripped so
 * there's only ever one of these documents.
 */
export default defineType({
  name: 'homeMedia',
  title: 'Home Media',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero carousel', default: true },
    { name: 'social', title: 'Social share' },
  ],
  fields: [
    defineField({
      name: 'heroImages',
      title: 'Hero carousel images',
      group: 'hero',
      type: 'array',
      description:
        'Images that cycle behind the headline on the home page. ~7s per image with a soft cross-fade. 1–8 images; pick the most striking pieces.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text (English)',
              type: 'string',
            }),
            defineField({
              name: 'altHe',
              title: 'Alt text (Hebrew)',
              type: 'string',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(8),
    }),

    defineField({
      name: 'ogImage',
      title: 'Site share image',
      group: 'social',
      type: 'image',
      description:
        'Used as the preview card when the bare site URL (yosiart.vercel.app) is pasted into WhatsApp / Instagram / Facebook. 1200×630 landscape works best — anything portrait gets letterboxed with black bars.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      first: 'heroImages.0',
    },
    prepare({ first }) {
      return {
        title: 'Home Media',
        subtitle: 'Hero carousel + share image',
        media: first,
      };
    },
  },
});
