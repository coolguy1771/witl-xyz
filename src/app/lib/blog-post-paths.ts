import fs from "fs";
import path from "path";

export const POSTS_DIRECTORY = path.resolve(process.cwd(), "posts");

/**
 * Builds a map from post slugs to absolute markdown file paths found in POSTS_DIRECTORY.
 *
 * @returns A Map whose keys are post slugs (filename without the `.md` extension) and whose values are the absolute paths to the corresponding `.md` files. The map will be empty if POSTS_DIRECTORY does not exist or contains no `.md` files.
 */
function buildPostPathMap(): Map<string, string> {
  const map = new Map<string, string>();

  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return map;
  }

  for (const fileName of fs.readdirSync(POSTS_DIRECTORY)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    const fileSlug = fileName.slice(0, -3);
    map.set(fileSlug, path.join(POSTS_DIRECTORY, fileName));
  }

  return map;
}

let postPathsBySlug = buildPostPathMap();

/**
 * Retrieve the current mapping of post slugs to their Markdown file paths.
 *
 * @returns A Map where each key is a post slug and each value is the absolute path to its `.md` file
 */
export function getPostPathsBySlug(): Map<string, string> {
  return postPathsBySlug;
}

/**
 * Recomputes the mapping of post slugs to absolute markdown file paths and replaces the module-level cached map.
 *
 * After calling this function, the module's cached slug→path map reflects the current contents of the posts directory.
 */
export function rebuildPostPathMap(): void {
  postPathsBySlug = buildPostPathMap();
}
