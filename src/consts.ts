// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = '제로의 블로그';
export const SITE_DESCRIPTION = '개발하며 배운 것들을 기록합니다.';
export const AUTHOR_NAME = 'Zero';
export const GITHUB_USERNAME = 'jgy4419';

// 카테고리 목록. 새 카테고리를 추가하려면 여기에 추가하고
// public/admin/config.yml 의 category select 에도 같이 추가하세요.
export const CATEGORIES = [
	'개발',
	'회고',
	'알고리즘',
	'프로젝트',
	'일상',
	'기타',
] as const;

export type Category = (typeof CATEGORIES)[number];
