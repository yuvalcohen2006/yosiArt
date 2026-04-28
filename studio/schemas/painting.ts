import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'painting',
  title: 'Painting',
  type: 'document',
  // Field grouping in the studio UI — keeps the form readable.
  groups: [
    { name: 'core', title: 'Painting', default: true },
    { name: 'details', title: 'Details' },
    { name: 'pricing', title: 'Pricing & status' },
  ],
  fields: [
    // --- core ---
    defineField({
      name: 'images',
      title: 'Images',
      group: 'core',
      type: 'array',
      description:
        'First image is used as the thumbnail and the social-share preview. Add more for detail / in-context shots.',
      of: [
        defineArrayMember({
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
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      group: 'core',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      group: 'core',
      type: 'slug',
      description:
        'URL segment, e.g. "rabbi-portrait-no-3". Auto-generated from English title; edit if needed.',
      options: {
        source: 'title.en',
        maxLength: 80,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      group: 'core',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      group: 'core',
      type: 'localizedText',
      description: 'A short paragraph about this piece. Optional.',
    }),

    // --- details ---
    defineField({
      name: 'year',
      title: 'Year',
      group: 'details',
      type: 'number',
      validation: (Rule) =>
        Rule.integer().min(1950).max(new Date().getFullYear() + 1),
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      group: 'details',
      type: 'localizedString',
      description: 'Defaults to "Acrylic on canvas" / "אקריליק על קנבס".',
      initialValue: {
        en: 'Acrylic on canvas',
        he: 'אקריליק על קנבס',
      },
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensions',
      group: 'details',
      type: 'object',
      fields: [
        defineField({
          name: 'widthCm',
          title: 'Width (cm)',
          type: 'number',
        }),
        defineField({
          name: 'heightCm',
          title: 'Height (cm)',
          type: 'number',
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured on home page',
      group: 'details',
      type: 'boolean',
      description:
        'Featured paintings rotate through the home-page hero carousel.',
      initialValue: false,
    }),

    // --- pricing & status ---
    defineField({
      name: 'priceILS',
      title: 'Price (₪ ILS)',
      group: 'pricing',
      type: 'number',
      description: 'Leave blank to show "Inquire for price".',
    }),
    defineField({
      name: 'priceUSD',
      title: 'Price ($ USD)',
      group: 'pricing',
      type: 'number',
      description: 'Leave blank to show "Inquire for price".',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      group: 'pricing',
      type: 'string',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Sold', value: 'sold' },
          { title: 'Reserved', value: 'reserved' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleHe: 'title.he',
      media: 'images.0',
      status: 'status',
      categoryEn: 'category.title.en',
    },
    prepare({ titleEn, titleHe, media, status, categoryEn }) {
      const subtitleParts = [categoryEn, status && status !== 'available' ? status.toUpperCase() : null]
        .filter(Boolean)
        .join(' · ');
      return {
        title: titleEn || titleHe || 'Untitled',
        subtitle: subtitleParts || undefined,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    {
      title: 'Year (newest first)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
});
