import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { koKRLocale } from '@sanity/locale-ko-kr';
import settings from '../src/data/blog-config.json';
import { categories, post } from './schema/post';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || settings.projectId;
if (!projectId)
  throw new Error('Set the Sanity project ID in src/data/blog-config.json before starting Studio.');
export default defineConfig({
  name: 'minsoo-blog',
  title: 'My Documents · 글쓰기',
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || settings.dataset,
  plugins: [
    structureTool({
      title: '내 글',
      structure: (S) =>
        S.list()
          .title('My Documents')
          .items([
            S.documentTypeListItem('blogPost').title('전체 글'),
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
    koKRLocale(),
  ],
  schema: {
    types: [post],
    templates: (previous) => [
      ...previous,
      ...categories.map((category) => ({
        id: `post-${category.value}`,
        title: `${category.title}에 글 쓰기`,
        schemaType: 'blogPost',
        value: () => ({ category: category.value, publishedAt: new Date().toISOString() }),
      })),
    ],
  },
});
