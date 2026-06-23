import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL segment, e.g. "originals". Auto-generated from English title; edit if needed.',
      options: {
        source: 'title.en',
        maxLength: 60,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedText',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first in nav and lists.',
      initialValue: 100,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      description: 'Used as the category card on the home page.',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      titleEn: 'title.en',
      titleHe: 'title.he',
      media: 'coverImage',
      order: 'order',
    },
    prepare({ titleEn, titleHe, media, order }) {
      return {
        title: titleEn || titleHe || 'Untitled category',
        subtitle: typeof order === 'number' ? `Order: ${order}` : undefined,
        media,
      };
    },
  },
});
