import config from '../data/blog-config.json';

export const folders = [
  { id: 'retrospective', name: 'Reflections' },
  { id: 'knowledge', name: 'Knowledge Base' },
  { id: 'daily', name: 'Daily Life' },
] as const;
export type FolderId = (typeof folders)[number]['id'];
export interface BlogPost {
  _id: string;
  title: string;
  category: FolderId;
  publishedAt: string;
  excerpt?: string;
}
export interface ContentBlock {
  _type: string;
  _key?: string;
  [key: string]: unknown;
}
export interface Article extends BlogPost {
  body: ContentBlock[];
  cover?: { url: string; alt?: string; caption?: string };
}
export const blogConfig = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || config.projectId,
  dataset: import.meta.env.VITE_SANITY_DATASET || config.dataset,
  studioUrl: import.meta.env.VITE_SANITY_STUDIO_URL || config.studioUrl,
};
export const isBlogConfigured = Boolean(blogConfig.projectId && blogConfig.dataset);
const published =
  '_type == "blogPost" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))';
const summary = '_id, title, category, "publishedAt": coalesce(publishedAt, _createdAt), excerpt';

async function query<T>(
  groq: string,
  signal: AbortSignal,
  parameters: Record<string, string> = {}
): Promise<T> {
  if (!isBlogConfigured) throw new Error('Blog is not configured');
  const url = new URL(
    `https://${blogConfig.projectId}.api.sanity.io/v2025-02-19/data/query/${blogConfig.dataset}`
  );
  url.searchParams.set('query', groq);
  url.searchParams.set('perspective', 'published');
  for (const [key, value] of Object.entries(parameters))
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  const response = await fetch(url, { signal, credentials: 'omit' });
  if (!response.ok) throw new Error('Could not load blog');
  const data = await response.json();
  if (data.error || !('result' in data)) throw new Error('Invalid blog response');
  return data.result as T;
}
export function fetchPosts(signal: AbortSignal) {
  return query<BlogPost[]>(
    `*[${published} && category in ["retrospective", "knowledge", "daily"]] | order(publishedAt desc, _createdAt desc) {${summary}}`,
    signal
  );
}
export function fetchArticle(id: string, signal: AbortSignal) {
  return query<Article | null>(
    `*[${published} && _id == $id][0] {${summary}, body[]{..., _type == "image" => {"url": asset->url}}, cover{"url": asset->url, alt, caption}}`,
    signal,
    { id }
  );
}
export type BlogLocation =
  | { kind: 'home' }
  | { kind: 'folder'; folder: FolderId }
  | { kind: 'post'; id: string };
export function readBlogLocation(): BlogLocation {
  const parts = window.location.hash.slice(1).split('/').filter(Boolean);
  if (parts[0] !== 'documents') return { kind: 'home' };
  if (parts[1] === 'post' && parts[2]) {
    try {
      return { kind: 'post', id: decodeURIComponent(parts[2]) };
    } catch {
      return { kind: 'home' };
    }
  }
  const folder = folders.find((item) => item.id === parts[1]);
  return folder ? { kind: 'folder', folder: folder.id } : { kind: 'home' };
}
export function blogPath(location: BlogLocation) {
  if (location.kind === 'post') return `#/documents/post/${encodeURIComponent(location.id)}`;
  return location.kind === 'folder' ? `#/documents/${location.folder}` : '#/documents';
}
export function safeLink(href?: string) {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function imageUrl(url?: string) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'cdn.sanity.io') return undefined;
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('w', '1400');
    parsed.searchParams.set('fit', 'max');
    return parsed.href;
  } catch {
    return undefined;
  }
}
