import type { BlogPost, BlogPostMetadata } from "../types/blog";

type SearchablePost = Pick<BlogPost, "slug" | "title" | "excerpt" | "tags">;

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function postMatchesQuery(post: SearchablePost, query: string): boolean {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return true;
  }

  const haystack = [post.title, post.excerpt, ...(post.tags ?? [])]
    .join(" ")
    .toLowerCase();

  return normalized.split(/\s+/).every((term) => haystack.includes(term));
}

export function searchPosts<T extends BlogPostMetadata | BlogPost>(
  posts: T[],
  query: string
): T[] {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return posts;
  }

  return posts.filter((post) => postMatchesQuery(post, normalized));
}
