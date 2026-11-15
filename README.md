# Dev Blog

Astro + GitHub Pages로 운영되는 개인 개발 블로그.
댓글은 giscus(GitHub Discussions)를 사용합니다.

## 로컬 실행

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # 프로덕션 빌드 → ./dist
npm run preview    # 빌드 결과 미리보기
```

## 글 작성

`src/content/blog/` 안에 `.md` 또는 `.mdx` 파일을 만듭니다.

```md
---
title: '포스트 제목'
description: '짧은 소개'
pubDate: '2026-11-15'
# updatedDate: '2026-11-20'
# heroImage: '../../assets/my-image.jpg'
---

본문 ...
```

스키마는 `src/content.config.ts` 에서 정의됩니다.

## 배포 전 설정 (한 번만)

### 1. `astro.config.mjs`

- `site`를 본인 GitHub Pages URL로 수정
- 프로젝트 저장소라면 `base: '/<repo-name>'` 주석 해제

```js
// 사용자 페이지 (repo = <username>.github.io)
site: 'https://myname.github.io',

// 프로젝트 페이지 (repo = my-blog)
site: 'https://myname.github.io',
base: '/my-blog',
```

### 2. `src/consts.ts`

`SITE_TITLE`, `SITE_DESCRIPTION`, `AUTHOR_NAME` 수정.

### 3. `src/components/Header.astro`

GitHub 링크의 `YOUR_USERNAME` 교체.

### 4. giscus 세팅 (`src/components/Giscus.astro`)

1. 저장소는 **public** 이어야 함
2. GitHub 저장소 Settings → General → Features → **Discussions 활성화**
3. [giscus.app](https://giscus.app)에 접속해 저장소를 입력하면
   `data-repo-id`, `data-category`, `data-category-id` 값을 발급해줍니다.
   그 값으로 `src/components/Giscus.astro`의 placeholder를 교체하세요.

### 5. GitHub Pages 활성화

저장소 Settings → **Pages** → Source를 **GitHub Actions**로 변경.

## 배포

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml`이
자동으로 빌드 & 배포합니다.

## 디렉토리 구조

```
├── .github/workflows/deploy.yml   GitHub Pages 자동 배포
├── public/                         정적 자산 (favicon 등)
├── src/
│   ├── assets/                     이미지 등 빌드 대상 자산
│   ├── components/
│   │   └── Giscus.astro            giscus 댓글 위젯
│   ├── content/blog/               포스트 Markdown
│   ├── layouts/BlogPost.astro      포스트 레이아웃
│   ├── pages/                      라우팅
│   ├── consts.ts                   사이트 전역 상수
│   └── content.config.ts           포스트 frontmatter 스키마
├── astro.config.mjs
└── package.json
```
