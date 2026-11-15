---
title: '첫 포스트: 블로그 시작하기'
description: 'Astro + GitHub Pages 조합으로 개발 블로그를 시작합니다.'
pubDate: '2026-11-15'
heroImage: '../../assets/blog-placeholder-3.jpg'
---

개발하면서 배운 것들을 기록하기 위해 블로그를 만들었습니다.
이 블로그는 [Astro](https://astro.build) 정적 사이트 생성기 위에서 동작하며,
GitHub Pages로 배포됩니다.

## 글쓰기 방법

`src/content/blog/` 폴더에 `.md` 또는 `.mdx` 파일을 하나 만들고,
아래처럼 frontmatter를 작성한 뒤 본문을 이어서 쓰면 됩니다.

```md
---
title: '포스트 제목'
description: '짧은 소개 문장'
pubDate: '2026-11-15'
# heroImage: '../../assets/my-image.jpg'  # 선택사항
---

여기부터 본문을 작성합니다.
```

## 왜 DB가 없을까?

정적 사이트 생성기(SSG)는 빌드 시점에 Markdown을 HTML로 변환해둡니다.
요청이 들어와도 DB를 조회하지 않고 미리 만들어둔 HTML을 바로 응답하므로
빠르고, 비용이 거의 들지 않고, GitHub Pages 같은 정적 호스팅에서 동작합니다.

댓글 같은 동적 기능은 [giscus](https://giscus.app)로 GitHub Discussions를 백엔드처럼 사용합니다.
