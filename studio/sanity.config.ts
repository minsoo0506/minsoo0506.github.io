import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import settings from '../src/data/blog-config.json';
import { categories, post } from './schema/post';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || settings.projectId;
if (!projectId)
  throw new Error('Set the Sanity project ID in src/data/blog-config.json before starting Studio.');
export default defineConfig({
  name: 'minsoo-blog',
  title: 'My Documents · Write',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || settings.dataset,
  plugins: [
    structureTool({
      title: 'My Posts',
      structure: (S) =>
        S.list()
          .title('My Documents')
          .items([
            S.documentTypeListItem('blogPost').title('All Posts'),
            S.divider(),
            ...categories.map((category) =>
              S.listItem()
                .id(category.value)
                .title(category.title)
                .child(
                  S.documentList()
                    .title(category.title)
                    .schemaType('blogPost')
                    .filter('_type == "blogPost" && category == $category')
                    .params({ category: category.value })
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                    .initialValueTemplates([S.initialValueTemplateItem(`post-${category.value}`)])
                )
            ),
          ]),
    }),
  ],
  schema: {
    types: [post],
    templates: (previous) => [
      ...previous,
      ...categories.map((category) => ({
        id: `post-${category.value}`,
        title: `New post in ${category.title}`,
        schemaType: 'blogPost',
        value: () => ({ category: category.value, publishedAt: new Date().toISOString() }),
      })),
    ],
  },
});
