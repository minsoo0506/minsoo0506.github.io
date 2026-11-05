import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentsWindow } from '../windows/DocumentsWindow';
import { fetchArticle, fetchPosts, imageUrl, safeLink } from '../../lib/blog';

const posts = [
  {
    _id: 'post-one',
    title: '첫 프로젝트 회고',
    category: 'retrospective',
    publishedAt: '2026-11-04T00:00:00Z',
  },
  {
    _id: 'post-two',
    title: '배운 내용 정리',
    category: 'knowledge',
    publishedAt: '2026-11-03T00:00:00Z',
  },
  { _id: 'post-three', title: '주말 산책', category: 'daily', publishedAt: '2026-11-02T00:00:00Z' },
];
const article = {
  ...posts[0],
  body: [
    {
      _type: 'block',
      _key: 'first',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: 'text', text: '본문을 읽을 수 있습니다.', marks: [] }],
    },
  ],
};
const fetchMock = vi.fn();
const response = (result: unknown) => ({ ok: true, json: async () => ({ result }) });
function route(hash: string) {
  act(() => {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}
beforeEach(() => {
  window.history.replaceState(null, '', '/');
  fetchMock.mockImplementation(async (url: URL) =>
    response(url.searchParams.has('$id') ? article : posts)
  );
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  fetchMock.mockReset();
  window.history.replaceState(null, '', '/');
});

describe('My Documents', () => {
  it('filters folder contents, searches titles, and opens an article using its shareable address', async () => {
    render(<DocumentsWindow />);
    await screen.findByRole('link', { name: /첫 프로젝트 회고/ });
    expect(screen.getByRole('table', { name: 'Documents' })).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.startsWith('#/documents/post/'))
    ).toHaveLength(3);
    fireEvent.click(
      within(screen.getByRole('navigation', { name: 'Folders' })).getByRole('button', {
        name: 'Reflections',
      })
    );
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: /주말 산책/ })).not.toBeInTheDocument()
    );
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search documents' }), {
      target: { value: '없는 제목' },
    });
    expect(screen.getByText('No matching documents.')).toBeInTheDocument();
    route('#/documents/post/post-one');
    expect(await screen.findByText('본문을 읽을 수 있습니다.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: '첫 프로젝트 회고' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to list' }));
    expect(window.location.hash).toBe('#/documents/retrospective');
  });
  it('opens a direct article link without requiring the list request to succeed', async () => {
    route('#/documents/post/post-one');
    fetchMock.mockImplementation(async (url: URL) =>
      url.searchParams.has('$id') ? response(article) : { ok: false }
    );
    render(<DocumentsWindow />);
    expect(await screen.findByText('본문을 읽을 수 있습니다.')).toBeInTheDocument();
  });
  it('shows an empty folder without inventing public posts', async () => {
    fetchMock.mockResolvedValue(response([]));
    render(<DocumentsWindow />);
    expect(await screen.findByText('This folder is empty.')).toBeInTheDocument();
  });
  it('retries a failed request and shows the recovered posts', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    render(<DocumentsWindow />);
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('link', { name: /주말 산책/ })).toBeInTheDocument();
  });
  it('handles missing or unpublished article links', async () => {
    route('#/documents/post/missing');
    fetchMock.mockImplementation(async (url: URL) =>
      response(url.searchParams.has('$id') ? null : posts)
    );
    render(<DocumentsWindow />);
    expect(await screen.findByText('Document not found.')).toBeInTheDocument();
  });
});
describe('public Sanity queries', () => {
  it('requests only published content without credentials and parameterizes document IDs', async () => {
    const signal = new AbortController().signal;
    await fetchPosts(signal);
    await fetchArticle('post" or true', signal);
    for (const [url, options] of fetchMock.mock.calls) {
      expect(url.searchParams.get('perspective')).toBe('published');
      expect(url.searchParams.get('query')).toContain('!(_id in path("drafts.**"))');
      expect(url.searchParams.get('query')).toContain('!(_id in path("versions.**"))');
      expect(options.credentials).toBe('omit');
      expect(options.signal).toBe(signal);
    }
    const url = fetchMock.mock.calls[1][0];
    expect(url.searchParams.get('$id')).toBe(JSON.stringify('post" or true'));
    expect(url.searchParams.get('query')).not.toContain('post" or true');
  });
  it('rejects executable links and only renders Sanity CDN images', () => {
    expect(safeLink('javascript:alert(1)')).toBeUndefined();
    expect(safeLink('https://example.com')).toBe('https://example.com/');
    expect(imageUrl('https://evil.example/picture.jpg')).toBeUndefined();
    expect(imageUrl('https://cdn.sanity.io/images/abc/production/image.jpg')).toContain(
      'auto=format'
    );
  });
});
