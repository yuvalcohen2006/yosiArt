import type { SchemaTypeDefinition } from 'sanity';

import localizedString from './localizedString';
import localizedText from './localizedText';
import localizedPortableText from './localizedPortableText';
import painting from './painting';
import category from './category';
import siteSettings from './siteSettings';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Reusable bilingual primitives
  localizedString,
  localizedText,
  localizedPortableText,
  // Document types
  painting,
  category,
  siteSettings,
];
