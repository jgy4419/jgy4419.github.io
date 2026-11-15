import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * 블로그 포스트 조회. 프로덕션 빌드에서는 draft:true 글을 제외,
 * dev 서버에서는 전부 보여줘서 작성 중 글을 미리볼 수 있게 함.
 */
export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog');
	if (import.meta.env.PROD) {
		return posts.filter((p) => !p.data.draft);
	}
	return posts;
}
