import type { StructureBuilder } from 'sanity/structure';

/**
 * Custom desk layout. Site Settings sits at the top as a singleton (one
 * editable doc, no list), then a divider, then standard document type
 * lists for paintings and categories.
 */
export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings'),
        ),
      S.listItem()
        .title('Home Media')
        .id('homeMedia')
        .child(
          S.document()
            .schemaType('homeMedia')
            .documentId('homeMedia'),
        ),
      S.divider(),
      S.documentTypeListItem('painting').title('Paintings'),
      S.documentTypeListItem('category').title('Categories'),
    ]);
