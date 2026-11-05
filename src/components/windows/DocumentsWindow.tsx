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
    : new Intl.DateTimeFormat('ko-KR', {
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
      setShareStatus('글 주소를 복사했습니다.');
    } catch {
      setShareStatus('브라우저 주소창의 주소를 복사해 주세요.');
    }
  };
  const studioUrl = safeLink(blogConfig.studioUrl);

  return (
    <section className="documents-explorer" aria-label="My Documents 블로그">
      <div className="documents-toolbar">
        <button onClick={back} disabled={location.kind === 'home'}>
          <ArrowLeft size={19} />
          <span>뒤로</span>
        </button>
        <button onClick={() => navigate({ kind: 'home' })}>
          <Home size={18} />
          <span>홈</span>
        </button>
        <span className="documents-divider" />
        <button onClick={() => setRevision((value) => value + 1)} aria-label="새로고침">
          <RefreshCw size={17} />
        </button>
        {studioUrl && (
          <a className="documents-write" href={studioUrl} target="_blank" rel="noopener noreferrer">
            <Pencil size={15} />
            글쓰기
          </a>
        )}
      </div>
      <nav className="documents-address" aria-label="현재 위치">
        <span>주소</span>
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
              <span className="documents-address-title">{article?.title || '글 읽기'}</span>
            </>
          )}
        </div>
      </nav>
      <div className="documents-layout">
        <aside className="documents-sidebar">
          <div className="documents-side-panel">
            <h2>내 기록</h2>
            <nav aria-label="폴더">
              <button
                aria-current={location.kind === 'home' ? 'page' : undefined}
                onClick={() => navigate({ kind: 'home' })}
              >
                <Home size={14} />
                전체 글
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
          <div className="documents-side-panel documents-details">
            <h2>자세한 정보</h2>
            <div>
              <FolderIcon />
              <strong>{folder?.name || 'My Documents'}</strong>
              <p>{folder?.description || '배움과 경험, 그리고 일상의 기록을 모았습니다.'}</p>
            </div>
          </div>
        </aside>
        <div className="documents-main" ref={content}>
          {location.kind === 'post' ? (
            <>
              {articleLoading ? (
                <div className="documents-message" role="status">
                  글을 여는 중입니다…
                </div>
              ) : articleError ? (
                <div className="documents-message" role="alert">
                  <FileText size={32} />
                  <h2>글을 불러오지 못했습니다.</h2>
                  <p>잠시 후 다시 시도해 주세요.</p>
                  <button onClick={() => setRevision((value) => value + 1)}>다시 시도</button>
                </div>
              ) : !article ? (
                <div className="documents-message">
                  <FileText size={32} />
                  <h2>글을 찾을 수 없습니다.</h2>
                  <p>삭제되었거나 아직 공개되지 않은 글입니다.</p>
                  <button onClick={() => navigate({ kind: 'home' })}>전체 글 보기</button>
                </div>
              ) : (
                <article className="documents-article">
                  <div className="documents-article-top">
                    <span>{folder?.name}</span>
                    <button onClick={share}>
                      <Share2 size={14} />
                      주소 복사
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
                    목록으로
                  </button>
                </article>
              )}
            </>
          ) : (
            <>
              <header className="documents-heading">
                <div>
                  <span>Minsoo's journal</span>
                  <h1>{folder?.name || 'My Documents'}</h1>
                  <p>{folder?.description || '기록하고, 모아두고, 다시 꺼내보기.'}</p>
                </div>
                <FolderIcon />
              </header>
              {location.kind === 'home' && (
                <div className="documents-folders">
                  {folders.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate({ kind: 'folder', folder: item.id })}
                    >
                      <FolderIcon />
                      <strong>{item.name}</strong>
                      <span>
                        {loading
                          ? '…'
                          : `${posts.filter((post) => post.category === item.id).length}개의 글`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="documents-list-tools">
                <h2>
                  {search ? '검색 결과' : location.kind === 'home' ? '최근 기록' : '폴더 안의 글'}
                </h2>
                <label>
                  <Search size={14} />
                  <input
                    type="search"
                    aria-label="글 검색"
                    placeholder="글 찾기"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>
              {loading ? (
                <div className="documents-message" role="status">
                  기록을 불러오는 중입니다…
                </div>
              ) : error ? (
                <div className="documents-message" role="alert">
                  <h2>기록을 불러오지 못했습니다.</h2>
                  <p>연결 상태를 확인하고 다시 시도해 주세요.</p>
                  <button onClick={() => setRevision((value) => value + 1)}>다시 시도</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="documents-message">
                  <FileText size={34} />
                  <h2>{search ? '검색 결과가 없습니다.' : '아직 기록이 없습니다.'}</h2>
                  <p>
                    {search
                      ? '다른 검색어로 찾아보세요.'
                      : '새로운 이야기가 이곳에 차곡차곡 쌓일 예정입니다.'}
                  </p>
                </div>
              ) : (
                <ul className="documents-posts">
                  {filtered.map((post) => (
                    <li key={post._id}>
                      <a href={blogPath({ kind: 'post', id: post._id })}>
                        <span className="documents-paper">
                          <FileText size={23} />
                        </span>
                        <div>
                          <h3>{post.title}</h3>
                          {post.excerpt && <p>{post.excerpt}</p>}
                          <span>{folders.find((item) => item.id === post.category)?.name}</span>
                        </div>
                        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        <ChevronRight size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
      <footer className="documents-status">
        <span>{postId ? '문서' : `${filtered.length}개의 글`}</span>
        <span>My Documents</span>
      </footer>
    </section>
  );
}
