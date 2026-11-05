# My Documents · 글쓰기

- 편집기: https://minsoo-documents-oxcedlbu.sanity.studio/
- 공개 블로그: https://minsoo0506.github.io/#/documents
- Sanity 프로젝트: `oxcedlbu` / 데이터셋: `production`

## 글 작성

1. 맥북 또는 휴대폰 브라우저에서 편집기를 열고 GitHub 계정으로 로그인합니다.
2. Reflections, Knowledge Base, Daily Life 중 폴더를 선택하고 새 글을 만듭니다.
3. 제목과 본문을 작성합니다. 사진은 본문의 추가 메뉴에서 업로드할 수 있습니다.
4. 변경 내용은 초안에 자동 저장됩니다. **Publish**을 눌러 공개합니다.
5. 공개 블로그의 새로고침 버튼으로 최신 목록을 확인합니다. 코드 배포는 필요 없습니다.

글의 공유 주소는 문서 ID로 자동 생성됩니다. URL을 직접 입력할 필요가 없습니다.
사진 설명과 캡션, 코드 블록, 링크, 제목 및 목록을 지원합니다.
대표 사진·짧은 소개·날짜는 **Details**에서 선택적으로 설정합니다.
공개 글을 숨기려면 편집기에서 발행 취소를 선택합니다.

## 개발

Studio는 Node.js 22.12 이상이 필요합니다. 포트폴리오 React 18과 별도로 React 19를 사용합니다.

```sh
cd studio
nvm use
npm ci
npm run dev
npm run typecheck
npm run build
npm run deploy
```

실제 글·사진은 Sanity에만 저장됩니다. 저장소에는 설정과 화면 코드만 있습니다.
프로젝트 ID와 데이터셋 이름, 편집기 주소는 공개 식별자이며 `../src/data/blog-config.json`에서 관리합니다.
인증 토큰은 프런트엔드 환경변수에 넣지 않습니다. 공개 화면은 토큰 없이 발행된 글만 읽습니다.

CORS: `https://minsoo0506.github.io`, `http://127.0.0.1:3106`, `http://localhost:3106`에는 읽기용으로 credentials를 허용하지 않습니다. Studio 로그인용 origin은 Sanity 배포가 관리합니다.
