import { defineArrayMember, defineField, defineType } from 'sanity';

export const categories = [
  { title: 'Reflections', value: 'retrospective' },
  { title: 'Knowledge Base', value: 'knowledge' },
  { title: 'Daily Life', value: 'daily' },
];
const imageFields = [
  defineField({
    name: 'alt',
    title: 'Alt text',
    type: 'string',
    description: 'Describe the image for readers who cannot see it.',
  }),
  defineField({ name: 'caption', title: 'Caption', type: 'string' }),
];
export const post = defineType({
  name: 'blogPost',
  title: 'Post',
  type: 'document',
  groups: [
    { name: 'writing', title: 'Write', default: true },
    { name: 'details', title: 'Details' },
  ],
  initialValue: () => ({ category: 'daily', publishedAt: new Date().toISOString() }),
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'writing',
      validation: (rule) => rule.required().error('Enter a title.'),
    }),
    defineField({
      name: 'category',
      title: 'Folder',
      type: 'string',
      group: 'writing',
      options: { list: categories, layout: 'radio', direction: 'horizontal' },
      validation: (rule) => rule.required().error('Choose a folder.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'writing',
      description: 'Use + to add images or code. Changes are saved as drafts. Publish when ready.',
      validation: (rule) => rule.required().min(1).error('Write some content.'),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Body', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bulleted list', value: 'bullet' },
            { title: 'Numbered list', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strikethrough', value: 'strike-through' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) =>
                      rule.required().uri({ scheme: ['https', 'http', 'mailto'] }),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          fields: imageFields,
        }),
        defineArrayMember({
          name: 'codeBlock',
          title: 'Code block',
          type: 'object',
          fields: [
            defineField({
              name: 'language',
              title: 'Language (optional)',
              type: 'string',
              options: {
                list: [
                  'JavaScript',
                  'TypeScript',
                  'Python',
                  'Java',
                  'C',
                  'C++',
                  'SQL',
                  'Shell',
                  'HTML',
                  'CSS',
                  'JSON',
                  'Other',
                ],
              },
            }),
            defineField({
              name: 'code',
              title: 'Code',
              type: 'text',
              rows: 12,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'language', subtitle: 'code' },
            prepare: ({ title, subtitle }) => ({ title: title || 'Code block', subtitle }),
          },
        }),
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Summary (optional)',
      type: 'text',
      rows: 3,
      group: 'details',
      description: 'Used when searching documents.',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'cover',
      title: 'Cover image (optional)',
      type: 'image',
      group: 'details',
      options: { hotspot: true },
      fields: imageFields,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Post date',
      type: 'datetime',
      group: 'details',
      description: 'Used for dates and sorting in the document list.',
    }),
  ],
  preview: {
    select: { title: 'title', category: 'category', media: 'cover' },
    prepare: ({ title, category, media }) => ({
      title: title || 'Untitled',
      subtitle: categories.find((item) => item.value === category)?.title || 'No folder',
      media,
    }),
  },
  orderings: [
    { title: 'Newest first', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
});
