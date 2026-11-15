import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// CMS에서 업로드된 이미지는 /uploads/filename.jpg 형태로 저장됨
			heroImage: z.string().optional(),
			category: z.string().default('기타'),
			tags: z.array(z.string()).default([]),
			// true면 프로덕션 빌드에서 숨김. dev에서는 항상 보임.
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
