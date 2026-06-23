import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { deskStructure } from './structure';

/**
 * Sanity Studio config.
 *
 * `projectId` and `dataset` are read from env vars so the same code works
 * in dev (.env.local) and prod (`sanity deploy`). After signup, set:
 *   SANITY_STUDIO_PROJECT_ID=<id from sanity.io/manage>
 *   SANITY_STUDIO_DATASET=production
 */
export default defineConfig({
  name: 'default',
  title: 'YosiArt',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',

  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Singleton handling for siteSettings + homeMedia: hide them from
  // the global "+ New" menu, and remove the duplicate/delete actions
  // on each so there's never more than one of either.
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (option) =>
            option.templateId !== 'siteSettings' &&
            option.templateId !== 'homeMedia',
        );
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      if (schemaType === 'siteSettings' || schemaType === 'homeMedia') {
        return prev.filter(
          ({ action }) => action !== 'duplicate' && action !== 'delete',
        );
      }
      return prev;
    },
  },
});
