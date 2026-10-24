/**
 * Build-time blog compiler: reads posts/*.md and writes bundled blog-data.ts
 */

import { watch as fsWatch } from "fs";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { BlogPost, BlogPostFrontMatter, Heading } from "../src/app/types/blog";

const POSTS_DIR = path.resolve(process.cwd(), "posts");
// Test-only posts, compiled only when INCLUDE_BLOG_FIXTURES=1 so they never ship to production
const FIXTURE_POSTS_DIR = path.resolve(process.cwd(), "tests/fixtures/posts");
const INCLUDE_FIXTURES = process.env.INCLUDE_BLOG_FIXTURES === "1";
const OUTPUT_DIR = path.resolve(process.cwd(), "src/app/generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "blog-data.ts");

const WORDS_PER_MINUTE = 200;
const EXCERPT_LENGTH = 150;
const SAFE_SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  // Sanitize before slug/highlight so only trusted plugins add ids and classes
  .use(rehypeSanitize)
  .use(rehypeSlug)
  .use(rehypeHighlight, { detect: true, ignoreMissing: true })
  .use(rehypeStringify);

function normalizeSlug(filename: string): string {
  const slug = filename.replace(/\.md$/, "");
  if (!slug || !SAFE_SLUG_PATTERN.test(slug)) {
    throw new Error(`Invalid post slug: ${filename}`);
  }
  return slug;
}

function normalizeAuthor(
  author: BlogPostFrontMatter["author"] | string | undefined
): BlogPost["author"] {
  if (!author) return undefined;
  if (typeof author === "string") return { name: author };
  if (typeof author === "object" && "name" in author) return author;
  return undefined;
}

function addCodeBlockMetadata(html: string): string {
  let result = html.replace(
    /<pre><code class="language-([^"]+)">/g,
    '<pre class="language-$1" data-language="$1"><code class="language-$1 hljs">'
  );
  result = result.replace(
    /<pre><code class="hljs language-([^"]+)">/g,
    '<pre class="language-$1" data-language="$1"><code class="language-$1 hljs">'
  );
  result = result.replace(/<pre><code>/g, '<pre data-language=""><code class="hljs">');
  return result;
}

function stripHtml(text: string): string {
  let cleaned = text;
  let previous = "";
  while (cleaned !== previous) {
    previous = cleaned;
    cleaned = cleaned.replace(/<[^>]*>/g, "");
  }
  return cleaned;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

/** Decode the entities rehype-stringify emits so heading text renders as plain text. */
function decodeEntities(text: string): string {
  return text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|([a-z]+));/gi, (match, hex, dec, name) => {
    if (hex || dec) {
      const code = hex ? parseInt(hex, 16) : parseInt(dec, 10);
      return Number.isInteger(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return NAMED_ENTITIES[name.toLowerCase()] ?? match;
  });
}

function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const matches = content.matchAll(/<h([2-3])\b([^>]*)>([\s\S]*?)<\/h\1>/g);

  for (const match of matches) {
    const idMatch = match[2].match(/\bid="([^"]+)"/);
    if (!idMatch) continue;

    headings.push({
      level: parseInt(match[1], 10),
      id: idMatch[1],
      text: decodeEntities(stripHtml(match[3])),
    });
  }

  return headings;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validatePostDate(slug: string, date: string): void {
  if (!ISO_DATE_PATTERN.test(date)) {
    throw new Error(`Invalid date format in post "${slug}": ${date} (expected YYYY-MM-DD)`);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid date in post "${slug}": ${date}`);
  }
}

function normalizeTags(tags: unknown): string[] {
  const list = Array.isArray(tags) ? tags : typeof tags === "string" ? [tags] : [];
  return list
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function compilePost(slug: string, filePath: string): Promise<BlogPost> {
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content: markdown } = matter(raw);
  const frontMatter = data as BlogPostFrontMatter & { author?: string };

  if (!frontMatter.title) {
    throw new Error(`Missing title in post: ${slug}`);
  }
  if (!frontMatter.date) {
    throw new Error(`Missing date in post: ${slug}`);
  }
  validatePostDate(slug, frontMatter.date);

  const result = await markdownProcessor.process(markdown);
  const contentHtml = addCodeBlockMetadata(result.toString());

  const wordCount = markdown.split(/\s+/g).filter(Boolean).length;
  const readingTime = `${Math.ceil(wordCount / WORDS_PER_MINUTE)} min read`;
  const excerpt =
    frontMatter.excerpt ||
    frontMatter.summary ||
    `${[...markdown].slice(0, EXCERPT_LENGTH).join("").replace(/[#*`]/g, "")}...`;

  return {
    slug,
    title: frontMatter.title,
    date: frontMatter.date,
    content: contentHtml,
    excerpt,
    readingTime,
    tags: normalizeTags(frontMatter.tags),
    coverImage: frontMatter.coverImage,
    featured: frontMatter.featured,
    author: normalizeAuthor(frontMatter.author),
    headings: extractHeadings(contentHtml),
  };
}

async function compileAll(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const sourceDirs = INCLUDE_FIXTURES ? [POSTS_DIR, FIXTURE_POSTS_DIR] : [POSTS_DIR];
  const files = (
    await Promise.all(
      sourceDirs.map(async (dir) => {
        try {
          const filenames = await fs.readdir(dir);
          return filenames.filter((f) => f.endsWith(".md")).map((f) => ({ filename: f, dir }));
        } catch {
          console.warn(`Posts directory not found: ${dir}`);
          return [];
        }
      })
    )
  ).flat();

  const posts = await Promise.all(
    files.map(({ filename, dir }) => compilePost(normalizeSlug(filename), path.join(dir, filename)))
  );

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const slugs = posts.map((p) => p.slug);
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) tagSet.add(tag);
  }
  const tags = [...tagSet].sort();

  const fileContents = `// Auto-generated by scripts/compile-blog.ts — do not edit
import type { BlogPost } from "@/app/types/blog";

export const blogPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)};

export const blogSlugs: string[] = ${JSON.stringify(slugs, null, 2)};

export const blogTags: string[] = ${JSON.stringify(tags, null, 2)};
`;

  await fs.writeFile(OUTPUT_FILE, fileContents, "utf8");
  console.log(`Compiled ${posts.length} blog post(s) → ${OUTPUT_FILE}`);
}

/** Recompile whenever a post changes (used by `bun run dev`). */
function watchPosts(): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const dirs = INCLUDE_FIXTURES ? [POSTS_DIR, FIXTURE_POSTS_DIR] : [POSTS_DIR];
  const onChange = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      compileAll().catch((error) => console.error("Blog compilation failed:", error));
    }, 100);
  };
  for (const dir of dirs) fsWatch(dir, onChange);
  console.log(`Watching ${dirs.join(", ")} for changes`);
}

compileAll()
  .then(() => {
    if (process.argv.includes("--watch")) watchPosts();
  })
  .catch((error) => {
    console.error("Blog compilation failed:", error);
    process.exit(1);
  });
