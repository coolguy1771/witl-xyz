import {
  getPostPathsBySlug,
  POSTS_DIRECTORY,
  rebuildPostPathMap,
} from "./blog-post-paths";

const SAFE_SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export { POSTS_DIRECTORY };

/**
 * Normalize and validate a blog post slug by removing a trailing `.md` and enforcing the safe slug pattern.
 *
 * @param slug - The input post slug; may include a trailing `.md`
 * @returns The normalized slug with any trailing `.md` removed, guaranteed to match the safe slug pattern
 * @throws Error if the resulting slug is empty or contains invalid characters
 */
export function normalizeBlogSlug(slug: string): string {
  const realSlug = slug.replace(/\.md$/, "");

  if (!realSlug || !SAFE_SLUG_PATTERN.test(realSlug)) {
    throw new Error(`Invalid post slug: ${slug}`);
  }

  return realSlug;
}

/**
 * Resolve a blog post slug to the post's markdown file path.
 *
 * @param slug - The post slug; may include a trailing `.md`.
 * @returns The resolved file system path for the post's markdown file.
 * @throws Error if no matching post file can be found for the normalized slug.
 */
export function resolvePostFilePath(slug: string, alreadyNormalized = false): string {
  const realSlug = alreadyNormalized ? slug : normalizeBlogSlug(slug);
  let fullPath = getPostPathsBySlug().get(realSlug);

  if (!fullPath) {
    rebuildPostPathMap();
    fullPath = getPostPathsBySlug().get(realSlug);
  }

  if (!fullPath) {
    throw new Error(`Post not found: ${realSlug}`);
  }

  return fullPath;
}

/**
 * Forces the cached mapping from blog post slugs to their file paths to be refreshed.
 */
export function clearPostPathCache(): void {
  rebuildPostPathMap();
}
