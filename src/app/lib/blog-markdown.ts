import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { BlogPost, BlogPostFrontMatter } from "../types/blog";

export type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function headingText(node: HastNode): string {
  if (node.type === "text") {
    return node.value ?? "";
  }
  return (node.children ?? []).map(headingText).join("");
}

export function applyHeadingIds(tree: HastNode) {
  const used = new Set<string>();
  walkHeadings(tree, used);
}

function assignHeadingIds() {
  return (tree: HastNode) => {
    applyHeadingIds(tree);
  };
}

function walkHeadings(node: HastNode, used: Set<string>) {
  if (node.type === "element" && node.tagName && /^h[1-6]$/.test(node.tagName)) {
    const props = (node.properties ??= {});
    const existing = typeof props.id === "string" ? props.id.trim() : "";
    if (existing) {
      used.add(existing);
    } else {
      props.id = uniqueSlug(headingText(node), used);
    }
  }
  for (const child of node.children ?? []) {
    walkHeadings(child, used);
  }
}

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
    .use(rehypeHighlight)
    .use(assignHeadingIds)
    .use(rehypeStringify)
    .process(markdown);
  return String(processed);
}
