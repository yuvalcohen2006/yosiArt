import { defineType, defineField } from 'sanity';

/**
 * Singleton — there should only ever be one of these. The structure tool
 * pins it to the top of the desk and the document.actions config in
 * sanity.config.ts removes its delete/duplicate actions.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'brand', title: 'Brand', default: true },
    { name: 'about', title: 'About / Bio' },
    { name: 'contact', title: 'Contact & Social' },
    { name: 'social', title: 'Social previews' },
  ],
  fields: [
    // --- brand ---
    defineField({
      name: 'brandName',
      title: 'Brand name',
      group: 'brand',
      type: 'localizedString',
      initialValue: { en: 'YosiArt', he: 'יוסי ארט' },
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      group: 'brand',
      type: 'localizedString',
      description: 'Short sub-headline shown on the home page.',
    }),

    // --- about ---
    defineField({
      name: 'artistBio',
      title: 'Artist bio',
      group: 'about',
      type: 'localizedPortableText',
      description: 'Renders on the About page.',
    }),
    defineField({
      name: 'artistPhoto',
      title: 'Artist photo',
      group: 'about',
      type: 'image',
      options: { hotspot: true },
    }),

    // --- contact & social ---
    defineField({
      name: 'contact',
      title: 'Contact details',
      group: 'contact',
      type: 'object',
      fields: [
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
          description: 'Used for the "Email about this" button on each painting.',
        }),
        defineField({
          name: 'whatsapp',
          title: 'WhatsApp number',
          type: 'string',
          description:
            'With country code, no spaces or +, e.g. 972541234567. Used to build wa.me links.',
        }),
        defineField({
          name: 'paypalMerchantEmail',
          title: 'PayPal merchant email',
          type: 'string',
          description:
            'Optional — used by the future PayPal Smart Buttons phase.',
        }),
      ],
    }),
    defineField({
      name: 'social',
      title: 'Social handles',
      group: 'contact',
      type: 'object',
      fields: [
        defineField({
          name: 'instagram',
          title: 'Instagram URL',
          type: 'url',
        }),
        defineField({
          name: 'facebook',
          title: 'Facebook URL',
          type: 'url',
        }),
      ],
    }),
    defineField({
      name: 'studioAddress',
      title: 'Studio address',
      group: 'contact',
      type: 'localizedText',
      description: 'Optional — shown on the contact page.',
    }),

    // --- social previews ---
    defineField({
      name: 'ogDefault',
      title: 'Default social-share image',
      group: 'social',
      type: 'image',
      description:
        'Fallback image used for link previews on WhatsApp, Instagram, Facebook when no painting-specific image is available. 1200x630 ideal.',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      brandEn: 'brandName.en',
      media: 'artistPhoto',
    },
    prepare({ brandEn, media }) {
      return {
        title: brandEn || 'Site Settings',
        subtitle: 'Site-wide settings',
        media,
      };
    },
  },
});
