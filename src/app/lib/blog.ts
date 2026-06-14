/**
 * Build-time blog data access — reads from generated blog-data.ts bundle.
 */

import { blogPosts, blogSlugs, blogTags } from "../generated/blog-data";
import { BlogPost, Heading } from "../types/blog";

const SAFE_SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

const postsBySlug = new Map(blogPosts.map((post) => [post.slug, post]));

export function normalizeBlogSlug(slug: string): string {
  const realSlug = slug.replace(/\.md$/, "");
  if (!realSlug || !SAFE_SLUG_PATTERN.test(realSlug)) {
    throw new Error(`Invalid post slug: ${slug}`);
  }
  return realSlug;
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const realSlug = normalizeBlogSlug(slug);
  const post = postsBySlug.get(realSlug);
  if (!post) {
    throw new Error(`Post not found: ${realSlug}`);
  }
  return post;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostSlugs(): Promise<string[]> {
  return [...blogSlugs];
}

export async function getPostsByTags(tags: string[]): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  if (!tags || tags.length === 0) return allPosts;
  return allPosts.filter(
    (post) => post.tags && post.tags.some((tag) => tags.includes(tag))
  );
}

export async function getFeaturedPosts(limit?: number): Promise<BlogPost[]> {
  const featured = (await getAllPosts()).filter((post) => post.featured);
  return limit ? featured.slice(0, limit) : featured;
}

export async function getAllTags(): Promise<string[]> {
  return [...blogTags];
}

export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  const candidates = allPosts.filter(
    (post) =>
      post.slug !== currentPost.slug && post.tags && post.tags.length > 0
  );

  if (
    candidates.length === 0 ||
    !currentPost.tags ||
    currentPost.tags.length === 0
  ) {
    return allPosts.filter((p) => p.slug !== currentPost.slug).slice(0, limit);
  }

  return candidates
    .map((post) => ({
      post,
      score: post.tags!.filter((tag) => currentPost.tags!.includes(tag)).length,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
    })
    .map((item) => item.post)
    .slice(0, limit);
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

export function extractHeadingsFromContent(content: string): Heading[] {
  const headings: Heading[] = [];
  const matches = content.matchAll(/<h([2-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/g);

  for (const match of matches) {
    headings.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: stripHtml(match[3]),
    });
  }

  return headings;
}

export function clearPostCache(): void {
  // No-op: data is static at build time
}
