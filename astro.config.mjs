// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// GitHub Pages 배포 시:
// - 사용자 페이지 (저장소명이 jgy4419.github.io): base 주석 유지
// - 프로젝트 페이지 (저장소명이 그 외, 예: blog): base 주석 해제 후 저장소명 입력
// https://docs.astro.build/en/guides/deploy/github/
export default defineConfig({
	site: 'https://jgy4419.github.io',
	// base: '/blog',
	integrations: [mdx(), sitemap()],
});
