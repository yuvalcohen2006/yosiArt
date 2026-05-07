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
      name: 'previewImage',
      title: 'Preview image (gallery cards)',
      group: 'core',
      type: 'image',
      description:
        'Shown on the Works grid and category pages as the card thumbnail. Pick a tightly-cropped, high-impact framing — the detail view uses a separate full image below. Optional: if left blank, the first detail image is used as a fallback.',
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
    defineField({
      name: 'images',
      title: 'Detail images',
      group: 'core',
      type: 'array',
      description:
        'Shown on the painting detail page (first image is the hero, the rest open in the lightbox gallery). Use the full, untrimmed painting plus any in-context / detail shots.',
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
      previewMedia: 'previewImage',
      detailMedia: 'images.0',
      status: 'status',
      categoryEn: 'category.title.en',
    },
    prepare({
      titleEn,
      titleHe,
      previewMedia,
      detailMedia,
      status,
      categoryEn,
    }) {
      const subtitleParts = [categoryEn, status && status !== 'available' ? status.toUpperCase() : null]
        .filter(Boolean)
        .join(' · ');
      return {
        title: titleEn || titleHe || 'Untitled',
        subtitle: subtitleParts || undefined,
        media: previewMedia ?? detailMedia,
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
