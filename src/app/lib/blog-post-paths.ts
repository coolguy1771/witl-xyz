import fs from "fs";
import path from "path";

export const POSTS_DIRECTORY = path.resolve(process.cwd(), "posts");

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

export function getPostPathsBySlug(): Map<string, string> {
  return postPathsBySlug;
}

export function rebuildPostPathMap(): void {
  postPathsBySlug = buildPostPathMap();
}
