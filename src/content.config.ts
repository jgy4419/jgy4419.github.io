import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// CMS는 비워둔 선택 필드를 빈 문자열("")로 저장할 때가 있음.
// zod 변환 전에 빈 문자열을 undefined로 치환해서 스키마가 통과하도록 함.
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
	z.preprocess((v) => (v === '' || v === null ? undefined : v), schema);

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: emptyToUndefined(z.coerce.date().optional()),
			heroImage: emptyToUndefined(z.string().optional()),
			category: z.string().default('기타'),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
