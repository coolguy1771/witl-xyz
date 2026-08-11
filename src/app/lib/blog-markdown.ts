import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { BlogPost, BlogPostFrontMatter } from "../types/blog";

export function stripHtmlTags(text: string): string {
  let previous: string;
  do {
    previous = text;
    text = text.replace(/<[^>]*>/g, "");
  } while (text !== previous);
  return text;
}

/** Slugifies a string for use as an HTML id attribute. */
export function slugify(text: string): string {
  const slug = stripHtmlTags(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

export function uniqueSlug(text: string, used: Set<string>): string {
  const base = slugify(text);
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

type FrontMatterAuthor = BlogPostFrontMatter["author"] | string | undefined;

export function normalizeAuthor(author: FrontMatterAuthor): BlogPost["author"] {
  if (!author) {
    return undefined;
  }
  if (typeof author === "string") {
    const name = author.trim();
    return name ? { name } : undefined;
  }
  const name = author.name?.trim();
  return name ? { name, avatar: author.avatar } : undefined;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSanitize)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);
  return String(processed);
}
