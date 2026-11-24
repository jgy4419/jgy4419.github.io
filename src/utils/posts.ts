import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * 블로그 포스트 조회. 프로덕션 빌드에서는 draft:true 글을 제외,
 * dev 서버에서는 전부 보여줘서 작성 중 글을 미리볼 수 있게 함.
 */
export async function getPublishedPosts(): Promise<Post[]> {
	const posts = await getCollection('blog');
	if (import.meta.env.PROD) {
		return posts.filter((p) => !p.data.draft);
	}
	return posts;
}

/**
 * 본문 글자 수 기반 대략 읽기 시간(분). 코드블록, 마크다운 기호 제외.
 * 한글 기준 분당 500자.
 */
export function readingTimeMin(body: string | undefined): number {
	if (!body) return 1;
	const text = body
		.replace(/```[\s\S]*?```/g, '') // fenced code
		.replace(/`[^`]*`/g, '') // inline code
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
		.replace(/\[[^\]]*\]\([^)]*\)/g, '') // links
		.replace(/[#*_>\-\|~]/g, '')
		.replace(/\s+/g, '');
	return Math.max(1, Math.round(text.length / 500));
}

/**
 * 날짜 순(최신→과거)으로 정렬된 공개 포스트.
 */
export async function getSortedPublished(): Promise<Post[]> {
	const posts = await getPublishedPosts();
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * 특정 글의 이전/다음 글.
 */
export function findAdjacent(sorted: Post[], currentId: string): { prev?: Post; next?: Post } {
	const i = sorted.findIndex((p) => p.id === currentId);
	if (i === -1) return {};
	// sorted 는 최신이 앞. "next" = 더 최신, "prev" = 더 과거.
	return {
		next: i > 0 ? sorted[i - 1] : undefined,
		prev: i < sorted.length - 1 ? sorted[i + 1] : undefined,
	};
}

/**
 * 같은 카테고리/태그 겹침 점수를 기반으로 관련 글 뽑기.
 */
export function findRelated(all: Post[], current: Post, limit = 3): Post[] {
	const currentTags = new Set(current.data.tags);
	const scored = all
		.filter((p) => p.id !== current.id)
		.map((p) => {
			let score = 0;
			if (p.data.category === current.data.category) score += 3;
			for (const t of p.data.tags) if (currentTags.has(t)) score += 1;
			return { p, score };
		})
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score || b.p.data.pubDate.valueOf() - a.p.data.pubDate.valueOf());
	return scored.slice(0, limit).map((x) => x.p);
}
