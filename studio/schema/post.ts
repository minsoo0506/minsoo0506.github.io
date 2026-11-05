import { defineArrayMember, defineField, defineType } from 'sanity';

export const categories = [
  { title: '회고', value: 'retrospective' },
  { title: '지식 저장소', value: 'knowledge' },
  { title: '일상', value: 'daily' },
];
const imageFields = [
  defineField({
    name: 'alt',
    title: '사진 설명',
    type: 'string',
    description: '사진을 볼 수 없는 독자에게 전달할 설명입니다.',
  }),
  defineField({ name: 'caption', title: '사진 아래에 표시할 글', type: 'string' }),
];
export const post = defineType({
  name: 'blogPost',
  title: '글',
  type: 'document',
  groups: [
    { name: 'writing', title: '글쓰기', default: true },
    { name: 'details', title: '추가 정보' },
  ],
  initialValue: () => ({ category: 'daily', publishedAt: new Date().toISOString() }),
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      group: 'writing',
      validation: (rule) => rule.required().error('제목을 입력해 주세요.'),
    }),
    defineField({
      name: 'category',
      title: '폴더',
      type: 'string',
      group: 'writing',
      options: { list: categories, layout: 'radio', direction: 'horizontal' },
      validation: (rule) => rule.required().error('폴더를 선택해 주세요.'),
    }),
    defineField({
      name: 'body',
      title: '본문',
      type: 'array',
      group: 'writing',
      description:
        '글을 쓰고, + 버튼으로 사진이나 코드 블록을 넣으세요. 변경 내용은 초안에 자동 저장되며, 발행하면 블로그에 공개됩니다.',
      validation: (rule) => rule.required().min(1).error('본문을 입력해 주세요.'),
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: '본문', value: 'normal' },
            { title: '큰 제목', value: 'h2' },
            { title: '작은 제목', value: 'h3' },
            { title: '인용', value: 'blockquote' },
          ],
          lists: [
            { title: '글머리 기호', value: 'bullet' },
            { title: '번호 목록', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: '굵게', value: 'strong' },
              { title: '기울임', value: 'em' },
              { title: '밑줄', value: 'underline' },
              { title: '취소선', value: 'strike-through' },
              { title: '코드', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                title: '링크',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: '주소',
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
          title: '사진',
          options: { hotspot: true },
          fields: imageFields,
        }),
        defineArrayMember({
          name: 'codeBlock',
          title: '코드 블록',
          type: 'object',
          fields: [
            defineField({
              name: 'language',
              title: '언어 (선택)',
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
                  '기타',
                ],
              },
            }),
            defineField({
              name: 'code',
              title: '코드',
              type: 'text',
              rows: 12,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'language', subtitle: 'code' },
            prepare: ({ title, subtitle }) => ({ title: title || '코드 블록', subtitle }),
          },
        }),
      ],
    }),
    defineField({
      name: 'excerpt',
      title: '짧은 소개 (선택)',
      type: 'text',
      rows: 3,
      group: 'details',
      description: '글 목록에서 제목 아래에 표시합니다.',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'cover',
      title: '대표 사진 (선택)',
      type: 'image',
      group: 'details',
      options: { hotspot: true },
      fields: imageFields,
    }),
    defineField({
      name: 'publishedAt',
      title: '글 날짜',
      type: 'datetime',
      group: 'details',
      description: '글 목록의 날짜와 정렬 순서에 사용합니다.',
    }),
  ],
  preview: {
    select: { title: 'title', category: 'category', media: 'cover' },
    prepare: ({ title, category, media }) => ({
      title: title || '제목 없는 글',
      subtitle: categories.find((item) => item.value === category)?.title || '폴더 미선택',
      media,
    }),
  },
  orderings: [
    { title: '최근 글 먼저', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
});
