import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Home,
  Pencil,
  RefreshCw,
  Search,
  Share2,
} from 'lucide-react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import {
  type Article,
  type BlogLocation,
  type BlogPost,
  blogConfig,
  blogPath,
  fetchArticle,
  fetchPosts,
  folders,
  imageUrl,
  isBlogConfigured,
  readBlogLocation,
  safeLink,
} from '../../lib/blog';
import './documents-window.css';

const textComponents: Partial<PortableTextComponents> = {
  types: {
    image: ({ value }) => {
      const url = imageUrl(value.url);
      return url ? (
        <figure>
          <img src={url} alt={value.alt || ''} loading="lazy" />
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      ) : null;
    },
    codeBlock: ({ value }) => (
      <figure className="documents-code">
        {value.language && <figcaption>{value.language}</figcaption>}
        <pre>
          <code>{value.code}</code>
        </pre>
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = safeLink(value?.href);
      return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <>{children}</>
      );
    },
  },
};
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
};
function FolderIcon({ small = false }: { small?: boolean }) {
  return (
    <img
      src="/images/folder.ico"
      alt=""
      className={small ? 'documents-folder-icon small' : 'documents-folder-icon'}
    />
  );
}

export function DocumentsWindow() {
  const [location, setLocation] = useState<BlogLocation>(readBlogLocation);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(isBlogConfigured);
  const [articleLoading, setArticleLoading] = useState(false);
  const [error, setError] = useState(false);
  const [articleError, setArticleError] = useState(false);
  const [search, setSearch] = useState('');
  const [revision, setRevision] = useState(0);
  const [shareStatus, setShareStatus] = useState('');
  const content = useRef<HTMLDivElement>(null);
  const postId = location.kind === 'post' ? location.id : null;

  useEffect(() => {
    const update = () => {
      setLocation(readBlogLocation());
      setSearch('');
      setShareStatus('');
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (!isBlogConfigured) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetchPosts(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setPosts(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    setArticle(null);
    setArticleError(false);
    if (!postId || !isBlogConfigured) {
      setArticleLoading(false);
      return;
    }
    const controller = new AbortController();
    setArticleLoading(true);
    fetchArticle(postId, controller.signal)
      .then((item) => {
        if (!controller.signal.aborted) setArticle(item);
      })
      .catch(() => {
        if (!controller.signal.aborted) setArticleError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setArticleLoading(false);
      });
    return () => controller.abort();
  }, [postId, revision]);
  useEffect(() => {
    content.current?.scrollTo?.(0, 0);
  }, [location]);

  const navigate = (next: BlogLocation) => {
    window.location.hash = blogPath(next);
    setLocation(next);
    setSearch('');
    setShareStatus('');
  };
  const folderId = location.kind === 'folder' ? location.folder : article?.category;
  const folder = folders.find((item) => item.id === folderId);
  const filtered = posts.filter(
    (post) =>
      (location.kind !== 'folder' || post.category === location.folder) &&
      `${post.title} ${post.excerpt || ''}`
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase())
  );
  const back = () =>
    navigate(
      location.kind === 'post' && folder ? { kind: 'folder', folder: folder.id } : { kind: 'home' }
    );
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus('Link copied.');
    } catch {
      setShareStatus('Copy the link from your address bar.');
    }
  };
  const studioUrl = safeLink(blogConfig.studioUrl);

  return (
    <section className="documents-explorer" aria-label="My Documents blog">
      <div className="documents-toolbar">
        <button onClick={back} disabled={location.kind === 'home'}>
          <ArrowLeft size={19} />
          <span>Back</span>
        </button>
        <button onClick={() => navigate({ kind: 'home' })}>
          <Home size={18} />
          <span>Home</span>
        </button>
        <span className="documents-divider" />
        <button onClick={() => setRevision((value) => value + 1)} aria-label="Refresh">
          <RefreshCw size={17} />
        </button>
        {studioUrl && (
          <a className="documents-write" href={studioUrl} target="_blank" rel="noopener noreferrer">
            <Pencil size={15} />
            Write
          </a>
        )}
      </div>
      <nav className="documents-address" aria-label="Current location">
        <span>Address</span>
        <div>
          <button onClick={() => navigate({ kind: 'home' })}>
            <FolderIcon small />
            My Documents
          </button>
          {folder && (
            <>
              <ChevronRight size={12} />
              <button onClick={() => navigate({ kind: 'folder', folder: folder.id })}>
                {folder.name}
              </button>
            </>
          )}
          {postId && (
            <>
              <ChevronRight size={12} />
              <span className="documents-address-title">{article?.title || 'Document'}</span>
            </>
          )}
        </div>
      </nav>
      <div className="documents-layout">
        <aside className="documents-sidebar">
          <div className="documents-side-panel">
            <h2>Folders</h2>
            <nav aria-label="Folders">
              <button
                aria-current={location.kind === 'home' ? 'page' : undefined}
                onClick={() => navigate({ kind: 'home' })}
              >
                <Home size={14} />
                All Posts
              </button>
              {folders.map((item) => (
                <button
                  key={item.id}
                  aria-current={folderId === item.id ? 'page' : undefined}
                  onClick={() => navigate({ kind: 'folder', folder: item.id })}
                >
                  <FolderIcon small />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </aside>
        <div className="documents-main" ref={content}>
          {location.kind === 'post' ? (
            <>
              {articleLoading ? (
                <div className="documents-message" role="status">
                  Loading document…
                </div>
              ) : articleError ? (
                <div className="documents-message" role="alert">
                  <FileText size={32} />
                  <h2>Unable to load this document.</h2>
                  <p>Please try again.</p>
                  <button onClick={() => setRevision((value) => value + 1)}>Retry</button>
                </div>
              ) : !article ? (
                <div className="documents-message">
                  <FileText size={32} />
                  <h2>Document not found.</h2>
                  <p>This document is unavailable.</p>
                  <button onClick={() => navigate({ kind: 'home' })}>All Posts</button>
                </div>
              ) : (
                <article className="documents-article">
                  <div className="documents-article-top">
                    <span>{folder?.name}</span>
                    <button onClick={share}>
                      <Share2 size={14} />
                      Copy link
                    </button>
                  </div>
                  <h1>{article.title}</h1>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  {shareStatus && (
                    <p className="documents-share-status" role="status">
                      {shareStatus}
                    </p>
                  )}
                  {imageUrl(article.cover?.url) && (
                    <figure>
                      <img src={imageUrl(article.cover?.url)} alt={article.cover?.alt || ''} />
                      {article.cover?.caption && <figcaption>{article.cover.caption}</figcaption>}
                    </figure>
                  )}
                  <div className="documents-prose">
                    <PortableText value={article.body || []} components={textComponents} />
                  </div>
                  <button className="documents-return" onClick={back}>
                    <ArrowLeft size={14} />
                    Back to list
                  </button>
                </article>
              )}
            </>
          ) : (
            <>
              <div className="documents-list-tools">
                <label>
                  <Search size={14} />
                  <input
                    type="search"
                    aria-label="Search documents"
                    placeholder="Search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>
              {loading ? (
                <div className="documents-message" role="status">
                  Loading documents…
                </div>
              ) : error ? (
                <div className="documents-message" role="alert">
                  <h2>Unable to load documents.</h2>
                  <p>Check your connection and try again.</p>
                  <button onClick={() => setRevision((value) => value + 1)}>Retry</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="documents-message">
                  <FileText size={34} />
                  <h2>{search ? 'No matching documents.' : 'This folder is empty.'}</h2>
                </div>
              ) : (
                <table className="documents-table" aria-label="Documents">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col" className="documents-date-column">
                        Date
                      </th>
                      <th scope="col" className="documents-folder-column">
                        Folder
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((post) => (
                      <tr key={post._id}>
                        <td>
                          <a href={blogPath({ kind: 'post', id: post._id })}>
                            <FileText size={16} />
                            <span>{post.title}</span>
                          </a>
                        </td>
                        <td className="documents-date-column">
                          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        </td>
                        <td className="documents-folder-column">
                          {folders.find((item) => item.id === post.category)?.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
      <footer className="documents-status">
        <span>
          {postId ? 'Document' : `${filtered.length} item${filtered.length === 1 ? '' : 's'}`}
        </span>
        <span>My Documents</span>
      </footer>
    </section>
  );
}
