import {
  getPostPathsBySlug,
  POSTS_DIRECTORY,
  rebuildPostPathMap,
} from "./blog-post-paths";

const SAFE_SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export { POSTS_DIRECTORY };

export function normalizeBlogSlug(slug: string): string {
  const realSlug = slug.replace(/\.md$/, "");

  if (!realSlug || !SAFE_SLUG_PATTERN.test(realSlug)) {
    throw new Error(`Invalid post slug: ${slug}`);
  }

  return realSlug;
}

export function resolvePostFilePath(slug: string): string {
  const realSlug = normalizeBlogSlug(slug);
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

export function clearPostPathCache(): void {
  rebuildPostPathMap();
}
