# My Documents blog

Approved scope: Sanity-only public blog, XP-themed reader opened from Start > My Documents, three folders (회고, 지식 저장소, 일상), comfortable writing on mobile and Mac. No repository content backups.

1. Configure a separate Sanity Studio (React 19, Node 22) with Korean labels, three folder views, rich text, images, captions, links and code blocks. Require only title, folder and body. Use document IDs in share links so authors never manage slugs. Native drafts and publish controls.
2. Add a public, token-free Sanity reader for published blogPost documents. Load summaries first, fetch body on opening a post. Handle cancellation, failure, empty state, unknown post and retry. Sanity holds all articles and images.
3. Build XP explorer UI with folder tiles, sidebar, breadcrumb, search, dates and readable article view. Touch-friendly single-click navigation, hash deep links and browser Back support.
4. Connect authenticated Sanity project, configure allowed origins, deploy hosted Studio, and store only public project/dataset/Studio configuration in the repo.
5. Test folder filtering, detail fetch, drafts exclusion, failures and deep linking. Typecheck/build frontend and Studio. Inspect desktop/mobile browser layouts and verify real Sanity API access.

Authentication is the only expected external dependency. Do not expose an auth token in frontend config. Do not publish placeholder articles as user content.
