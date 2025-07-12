import { BlogPost, BlogPostFrontMatter, Heading } from "../types/blog";

// Configuration
const WORDS_PER_MINUTE = 200;
const EXCERPT_LENGTH = 150;
const MAX_CACHE_AGE = 60 * 60; // 1 hour in seconds
const MAX_POSTS_PER_PAGE = 10;
const MAX_RELATED_POSTS = 5;

// KV namespace for blog posts
interface KVNamespace {
  get(key: string, options?: { type: "json" }): Promise<any>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl: number; metadata?: any }
  ): Promise<void>;
  list(options?: { prefix: string }): Promise<{ keys: { name: string }[] }>;
}

// Development fallback for KV
class DevKV implements KVNamespace {
class DevKV implements KVNamespace {
  private store: Map<string, { value: string; metadata?: Record<string, unknown> }> = new Map();

  async get<T = string>(key: string, options?: { type: "json" }): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    return options?.type === "json"
      ? (JSON.parse(item.value) as T)
      : (item.value as T);
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl: number; metadata?: Record<string, unknown> }
  ) {
    this.store.set(key, { value, metadata: options?.metadata });
  }
}
  }

  async list(options?: { prefix: string }) {
    const keys = Array.from(this.store.keys())
      .filter(key => !options?.prefix || key.startsWith(options.prefix))
      .map(name => ({ name }));
    return { keys };
  }
}

// Use environment variable for KV namespace or fallback to dev implementation
const BLOG_POSTS: KVNamespace = process.env.BLOG_POSTS_NAMESPACE
  ? (globalThis as any)[process.env.BLOG_POSTS_NAMESPACE]
  : new DevKV();

// Cache configuration
interface CacheConfig {
  ttl: number;
  staleWhileRevalidate: boolean;
  maxAge: number;
}

const CACHE_CONFIG: CacheConfig = {
  ttl: MAX_CACHE_AGE,
  staleWhileRevalidate: true,
  maxAge: MAX_CACHE_AGE * 2,
};

// Markdown plugin configuration
interface MarkdownPlugin {
  name: string;
  transform: (content: string) => string;
}

const markdownPlugins: MarkdownPlugin[] = [
  {
    name: "tables",
    transform: content => {
      return content.replace(
        /^\|(.+)\|$/gm,
        match =>
          `<table><tr>${match
            .split("|")
            .map(cell => `<td>${cell.trim()}</td>`)
            .join("")}</tr></table>`
      );
    },
  },
  {
    name: "blockquotes",
    transform: content => {
      return content.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
    },
  },
  {
    name: "tasklists",
    transform: content => {
      return content.replace(
        /^- \[([ x])\] (.+)$/gm,
        (_, checked, text) =>
          `<div class="task-item"><input type="checkbox" ${checked === "x" ? "checked" : ""} disabled> ${text}</div>`
      );
    },
  },
  {
    name: "footnotes",
    transform: content => {
      // Extract footnotes
      const footnoteRefs = new Map<string, string>();
      let footnoteCounter = 1;

      // Replace footnote references [^1] with links
      content = content.replace(/\[\^(\d+)\]/g, (_, id) => {
        const refId = `fn-${id}`;
        footnoteRefs.set(refId, id);
        return `<sup><a href="#${refId}" id="fnref-${id}">${id}</a></sup>`;
      });

      // Replace footnote definitions
      content = content.replace(/^\[\^(\d+)\]:\s+(.+)$/gm, (_, id, text) => {
        const refId = `fn-${id}`;
        return `<div class="footnote" id="${refId}">${footnoteCounter++}. ${text} <a href="#fnref-${id}">↩</a></div>`;
      });

      // Add footnotes section if there are any
      if (footnoteRefs.size > 0) {
        content += '\n\n<div class="footnotes">\n<hr>\n';
        footnoteRefs.forEach((id, refId) => {
          content += `<div class="footnote" id="${refId}">${id}. <a href="#fnref-${id}">↩</a></div>\n`;
        });
        content += "</div>";
      }

      return content;
    },
  },
  {
    name: "math",
    transform: content => {
      // Inline math: $...$
      content = content.replace(/\$([^\$]+)\$/g, (_, math) => {
        return `<span class="math-inline">${math}</span>`;
      });

      // Block math: $$...$$
      content = content.replace(/\$\$([^\$]+)\$\$/g, (_, math) => {
        return `<div class="math-block">${math}</div>`;
      });

      return content;
    },
  },
  {
    name: "diagrams",
    transform: content => {
      // Mermaid diagrams
      content = content.replace(
        /```mermaid\n([\s\S]*?)```/g,
        (_, diagram) => `<div class="mermaid">${diagram.trim()}</div>`
      );

      // PlantUML diagrams
      content = content.replace(
        /```plantuml\n([\s\S]*?)```/g,
        (_, diagram) => `<div class="plantuml">${diagram.trim()}</div>`
      );

      return content;
    },
  },
  {
    name: "custom-blocks",
    transform: content => {
      // Info blocks
      content = content.replace(
        /:::info\n([\s\S]*?):::/g,
        '<div class="custom-block info">$1</div>'
      );

      // Warning blocks
      content = content.replace(
        /:::warning\n([\s\S]*?):::/g,
        '<div class="custom-block warning">$1</div>'
      );

      // Tip blocks
      content = content.replace(
        /:::tip\n([\s\S]*?):::/g,
        '<div class="custom-block tip">$1</div>'
      );

      // Note blocks
      content = content.replace(
        /:::note\n([\s\S]*?):::/g,
        '<div class="custom-block note">$1</div>'
      );

      return content;
    },
  },
];

/**
 * Gets a blog post by its slug with enhanced caching
 * @param slug - The post slug (with or without .md extension)
 * @returns The blog post data
 */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const realSlug = slug.replace(/\.md$/, "");

  // Try to get from KV store with stale-while-revalidate
  const cachedPost = await BLOG_POSTS.get(realSlug, { type: "json" });
  if (cachedPost) {
    // Start background revalidation if stale
    if (CACHE_CONFIG.staleWhileRevalidate) {
      revalidatePost(realSlug).catch(console.error);
    }
    return cachedPost as BlogPost;
  }

  return await fetchAndProcessPost(realSlug);
}

/**
 * Fetches and processes a post from origin
 * @param slug - The post slug
 * @returns The processed blog post
 */
async function fetchAndProcessPost(slug: string): Promise<BlogPost> {
  // If not in KV, fetch from origin
  const response = await fetch(
    `https://${BLOG_POSTS.get("ORIGIN")}/posts/${slug}.md`
  );

  if (!response.ok) {
    throw new Error(`Post not found: ${slug}`);
  }

  const content = await response.text();

  // Parse frontmatter using a simple regex-based parser
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontMatterMatch) {
    throw new Error(`Invalid post format: ${slug}`);
  }

  const [, frontMatterStr, markdownContent] = frontMatterMatch;
  const frontMatter = parseFrontMatter(frontMatterStr);

  // Enhanced validation
  validateFrontMatter(frontMatter, slug);

  // Convert markdown to HTML using enhanced parser
  const contentHtml = await convertMarkdownToHtml(markdownContent);

  // Calculate reading time with enhanced algorithm
  const readingTime = calculateReadingTime(markdownContent);

  // Create excerpt with improved formatting
  const excerpt = createExcerpt(markdownContent, frontMatter.excerpt);

  // Create post object with additional metadata
  const post: BlogPost = {
    slug,
    title: frontMatter.title,
    date: frontMatter.date,
    content: contentHtml,
    excerpt,
    readingTime,
    tags: frontMatter.tags || [],
    coverImage: frontMatter.coverImage,
    featured: frontMatter.featured,
    author: frontMatter.author,
    metadata: {
      slug,
      title: frontMatter.title,
      date: frontMatter.date,
      excerpt,
      readingTime,
      tags: frontMatter.tags || [],
      coverImage: frontMatter.coverImage,
      featured: frontMatter.featured,
      author: frontMatter.author,
      wordCount: countWords(markdownContent),
      lastModified: new Date().toISOString(),
      categories: frontMatter.categories || [],
      series: frontMatter.series,
      language: frontMatter.language || "en",
    },
  };

  // Cache the post in KV with metadata
  await cachePost(slug, post);

  return post;
}

/**
 * Validates frontmatter with detailed error messages
 * @param frontMatter - The frontmatter to validate
 * @param slug - The post slug for error messages
 */
function validateFrontMatter(
  frontMatter: BlogPostFrontMatter,
  slug: string
): void {
  const errors: string[] = [];

  if (!frontMatter.title) {
    errors.push("Missing title");
  }

  if (!frontMatter.date) {
    errors.push("Missing date");
  } else {
    const date = new Date(frontMatter.date);
    if (isNaN(date.getTime())) {
      errors.push("Invalid date format");
    }
  }

  if (frontMatter.tags && !Array.isArray(frontMatter.tags)) {
    errors.push("Tags must be an array");
  }

  if (frontMatter.categories && !Array.isArray(frontMatter.categories)) {
    errors.push("Categories must be an array");
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid frontmatter in post ${slug}: ${errors.join(", ")}`
    );
  }
}

/**
 * Calculates reading time with enhanced algorithm
 * @param content - The markdown content
 * @returns Formatted reading time
 */
function calculateReadingTime(content: string): string {
  const words = content.split(/\s+/g).length;
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
  const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

  // Adjust reading time based on content type
  const adjustedWords = words + codeBlocks * 50 + images * 10;
  const minutes = Math.ceil(adjustedWords / WORDS_PER_MINUTE);

  return `${minutes} min read`;
}

/**
 * Creates an excerpt with improved formatting
 * @param content - The markdown content
 * @param customExcerpt - Optional custom excerpt
 * @returns Formatted excerpt
 */
function createExcerpt(content: string, customExcerpt?: string): string {
  if (customExcerpt) {
    return customExcerpt;
  }

  // Remove code blocks and images for better excerpt
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/[#*`]/g, "")
    .trim();

  return cleanContent.slice(0, EXCERPT_LENGTH) + "...";
}

/**
 * Counts words in content
 * @param content - The content to count
 * @returns Word count
 */
function countWords(content: string): number {
  return content.split(/\s+/g).length;
}

/**
 * Caches a post with metadata
 * @param slug - The post slug
 * @param post - The post to cache
 */
async function cachePost(slug: string, post: BlogPost): Promise<void> {
  await BLOG_POSTS.put(slug, JSON.stringify(post), {
    expirationTtl: CACHE_CONFIG.ttl,
    metadata: {
      lastModified: new Date().toISOString(),
      cacheControl: `max-age=${CACHE_CONFIG.maxAge}`,
    },
  });
}

/**
 * Revalidates a post in the background
 * @param slug - The post slug to revalidate
 */
async function revalidatePost(slug: string): Promise<void> {
  try {
    const post = await fetchAndProcessPost(slug);
    await cachePost(slug, post);
  } catch (error) {
    console.error(`Failed to revalidate post ${slug}:`, error);
  }
}

/**
 * Gets all blog posts with pagination
 * @param page - Page number (1-based)
 * @param limit - Posts per page
 * @returns Object containing posts and pagination info
 */
export async function getPaginatedPosts(
  page: number = 1,
  limit: number = MAX_POSTS_PER_PAGE
): Promise<{
  posts: BlogPost[];
  pagination: { total: number; pages: number; current: number };
}> {
  const allPosts = await getAllPosts();
  const total = allPosts.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    posts: allPosts.slice(start, end),
    pagination: {
      total,
      pages,
      current: page,
    },
  };
}

/**
 * Gets related posts with enhanced algorithm
 * @param currentPost - The current blog post
 * @param limit - Maximum number of related posts
 * @returns Array of related posts
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = MAX_RELATED_POSTS
): Promise<BlogPost[]> {
  try {
    const allPosts = await getAllPosts();

    // Filter out current post
    const candidates = allPosts.filter(post => post.slug !== currentPost.slug);

    // Calculate similarity scores
    const scoredPosts = candidates.map(post => ({
      post,
      score: calculatePostSimilarity(currentPost, post),
    }));

    // Sort by similarity score and date
    return scoredPosts
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return (
          new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
        );
      })
      .map(item => item.post)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting related posts:", error);
    return [];
  }
}

/**
 * Calculates similarity between two posts
 * @param post1 - First post
 * @param post2 - Second post
 * @returns Similarity score (0-1)
 */
function calculatePostSimilarity(post1: BlogPost, post2: BlogPost): number {
  let score = 0;

  // Tag similarity (50% weight)
  if (post1.tags && post2.tags) {
    const commonTags = post1.tags.filter(tag => post2.tags!.includes(tag));
    score +=
      (commonTags.length / Math.max(post1.tags.length, post2.tags.length)) *
      0.5;
  }

  // Category similarity (30% weight)
  if (post1.metadata?.categories && post2.metadata?.categories) {
    const commonCategories = post1.metadata.categories.filter(cat =>
      post2.metadata!.categories!.includes(cat)
    );
    score +=
      (commonCategories.length /
        Math.max(
          post1.metadata.categories.length,
          post2.metadata.categories.length
        )) *
      0.3;
  }

  // Series similarity (20% weight)
  if (post1.metadata?.series && post2.metadata?.series) {
    score += post1.metadata.series === post2.metadata.series ? 0.2 : 0;
  }

  return score;
}

/**
 * Converts markdown to HTML with enhanced features
 * @param markdown - The markdown content
 * @returns HTML content
 */
async function convertMarkdownToHtml(markdown: string): Promise<string> {
  let html = markdown;

  // Apply markdown plugins
  for (const plugin of markdownPlugins) {
    html = plugin.transform(html);
  }

  // Basic markdown conversion
  html = html
    // Headers
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")

    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    // Code blocks with syntax highlighting
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || "text";
      return `<pre class="language-${language}"><code class="language-${language}">${code.trim()}</code></pre>`;
    })

    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")

    // Lists
    .replace(/^\s*[-*+]\s+(.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")

    // Numbered lists
    .replace(/^\s*\d+\.\s+(.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ol>$1</ol>")

    // Images with lazy loading
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" loading="lazy">'
    )

    // Paragraphs
    .replace(/^\s*(\n)?(.+)/gm, m => {
      return /\<(\/)?(h|ul|ol|li|blockquote|pre|img)/.test(m)
        ? m
        : `<p>${m}</p>`;
    })

    // Line breaks
    .replace(/\n/g, "<br />");

  // Add IDs to headings for TOC linking
  html = html.replace(/<h([2-3])>(.*?)<\/h\1>/g, (match, level, content) => {
    const id = content
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h${level} id="${id}">${content}</h${level}>`;
  });

  return html;
}

/**
 * Gets all post slugs
 * @returns Array of post slugs without the .md extension
 */
export async function getPostSlugs(): Promise<string[]> {
  // Get list of posts from KV
  const list = await BLOG_POSTS.list({ prefix: "post:" });
  return list.keys.map(key => key.name.replace("post:", ""));
}

/**
 * Gets all blog posts
 * @returns Array of blog posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // Get all post slugs
    const slugs = await getPostSlugs();

    // Get all posts data with error handling for individual posts
    const postsPromises = slugs.map(async slug => {
      try {
        return await getPostBySlug(slug);
      } catch (error) {
        console.error(`Error processing post ${slug}:`, error);
        return null;
      }
    });

    const posts = await Promise.all(postsPromises);

    // Filter out null values (failed posts) and sort by date
    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort(
        (post1, post2) =>
          new Date(post2.date).getTime() - new Date(post1.date).getTime()
      );
  } catch (error) {
    console.error("Error getting all posts:", error);
    return [];
  }
}

/**
 * Gets posts with specific tags
 * @param tags - Array of tags to filter by
 * @returns Array of matching blog posts sorted by date
 */
export async function getPostsByTags(tags: string[]): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();

  if (!tags || tags.length === 0) {
    return allPosts;
  }

  return allPosts.filter(
    post => post.tags && post.tags.some(tag => tags.includes(tag))
  );
}

/**
 * Gets all unique tags from all blog posts
 * @returns Array of unique tags sorted alphabetically
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const posts = await getAllPosts();

    // Collect all tags from all posts
    const allTags = posts.reduce<string[]>((tags, post) => {
      if (post.tags && post.tags.length > 0) {
        tags.push(...post.tags);
      }
      return tags;
    }, []);

    // Return unique tags sorted alphabetically
    return [...new Set(allTags)].sort();
  } catch (error) {
    console.error("Error getting all tags:", error);
    return [];
  }
}

/**
 * Gets featured blog posts
 * @param limit - Maximum number of featured posts to return
 * @returns Array of featured posts sorted by date
 */
export async function getFeaturedPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const allPosts = await getAllPosts();

    // Filter featured posts
    const featuredPosts = allPosts.filter(post => post.featured);

    // Limit the number of posts if specified
    return limit ? featuredPosts.slice(0, limit) : featuredPosts;
  } catch (error) {
    console.error("Error getting featured posts:", error);
    return [];
  }
}

// Helper functions

/**
 * Parses frontmatter from a string
 * @param frontMatterStr - The frontmatter string
 * @returns Parsed frontmatter object
 */
function parseFrontMatter(frontMatterStr: string): BlogPostFrontMatter {
  const frontMatter: Record<string, any> = {};

  // Split into lines and parse each line
  const lines = frontMatterStr.split("\n");
  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      const value = valueParts.join(":").trim();

      // Try to parse as JSON for arrays and objects
      try {
        frontMatter[key.trim()] = JSON.parse(value);
      } catch {
        // If not valid JSON, use as is
        frontMatter[key.trim()] = value;
      }
    }
  }

  return frontMatter as BlogPostFrontMatter;
}
