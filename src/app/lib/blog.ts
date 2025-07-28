import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { BlogPost, BlogPostFrontMatter, Heading } from "../types/blog";

// Configuration
const postsDirectory = path.join(process.cwd(), "posts");
const WORDS_PER_MINUTE = 200;
const EXCERPT_LENGTH = 150;

// Simple cache to avoid repeatedly reading the same files
const postCache = new Map<string, BlogPost>();

/**
 * Gets a blog post by its slug
 * @param slug - The post slug (with or without .md extension)
 * @param useCache - Whether to use cached posts (default: true)
 * @returns The blog post data
 */
export async function getPostBySlug(slug: string, useCache: boolean = true): Promise<BlogPost> {
  const realSlug = slug.replace(/\.md$/, "");

  // Return cached post if available and caching is enabled
  if (useCache && postCache.has(realSlug)) {
    return postCache.get(realSlug)!;
  }

  const fullPath = path.join(postsDirectory, `${realSlug}.md`);

  // Check if file exists
  if (!existsSync(fullPath)) {
    throw new Error(`Post not found: ${realSlug}`);
  }

  // Read file asynchronously
  const fileContents = await fs.readFile(fullPath, "utf8");

  // Parse frontmatter
  const { data, content } = matter(fileContents);
  const frontMatter = data as BlogPostFrontMatter;

  // Validate required fields
  if (!frontMatter.title) {
    throw new Error(`Missing title in post: ${realSlug}`);
  }

  if (!frontMatter.date) {
    throw new Error(`Missing date in post: ${realSlug}`);
  }

  // Convert markdown to HTML
  // Note: The client-side highlight.js will handle syntax highlighting
  const processedContent = await remark()
    .use(html, {
      sanitize: false, // Disable sanitize to allow class attributes on code blocks
    })
    .process(content);

  // Process the HTML string to add language classes for highlight.js
  let contentHtml = processedContent.toString();

  // Add language classes to code blocks using regex
  contentHtml = contentHtml.replace(
    /<pre><code class="language-([^"]+)">/g,
    '<pre class="language-$1"><code class="language-$1">'
  );

  // Add IDs to headings for TOC linking if they don't already have IDs
  contentHtml = contentHtml.replace(/<h([2-3])>(.*?)<\/h\1>/g, (match, level, content) => {
    const id = content
      .toLowerCase()
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-"); // Replace spaces with hyphens
    return `<h${level} id="${id}">${content}</h${level}>`;
  });

  // Calculate reading time
  const wordCount = content.split(/\s+/g).length;
  const readingTime = `${Math.ceil(wordCount / WORDS_PER_MINUTE)} min read`;

  // Create excerpt if not provided
  const excerpt =
    frontMatter.excerpt || content.slice(0, EXCERPT_LENGTH).replace(/[#*`]/g, "") + "...";

  // Create post object
  const post: BlogPost = {
    slug: realSlug,
    title: frontMatter.title,
    date: frontMatter.date,
    content: contentHtml,
    excerpt,
    readingTime,
    tags: frontMatter.tags || [],
    coverImage: frontMatter.coverImage,
  };

  // Cache the post
  if (useCache) {
    postCache.set(realSlug, post);
  }

  return post;
}

/**
 * Gets all post slugs
 * @returns Array of post slugs without the .md extension
 */
export async function getPostSlugs(): Promise<string[]> {
  try {
    const filenames = await fs.readdir(postsDirectory);
    return filenames
      .filter((filename) => filename.endsWith(".md"))
      .map((filename) => filename.replace(/\.md$/, ""));
  } catch (error) {
    console.error("Error reading post slugs:", error);
    return [];
  }
}

/**
 * Gets all blog posts
 * @param useCache - Whether to use cached posts (default: true)
 * @returns Array of blog posts sorted by date (newest first)
 */
export async function getAllPosts(useCache: boolean = true): Promise<BlogPost[]> {
  try {
    // Get all post slugs
    const slugs = await getPostSlugs();

    // Get all posts data with error handling for individual posts
    const postsPromises = slugs.map(async (slug) => {
      try {
        return await getPostBySlug(slug, useCache);
      } catch (error) {
        console.error(`Error processing post ${slug}:`, error);
        return null;
      }
    });

    const posts = await Promise.all(postsPromises);

    // Filter out null values (failed posts) and sort by date
    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort((post1, post2) => new Date(post2.date).getTime() - new Date(post1.date).getTime());
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

  return allPosts.filter((post) => post.tags && post.tags.some((tag) => tags.includes(tag)));
}

/**
 * Clears the post cache
 */
export function clearPostCache(): void {
  postCache.clear();
}

/**
 * Gets related posts based on matching tags
 * @param currentPost - The current blog post
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Array of related posts sorted by matching tag count and date
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 3
): Promise<BlogPost[]> {
  try {
    // Get all posts
    const allPosts = await getAllPosts();

    // Filter out the current post and posts without tags
    const candidates = allPosts.filter(
      (post) => post.slug !== currentPost.slug && post.tags && post.tags.length > 0
    );

    // If no candidates or current post has no tags, return most recent posts
    if (candidates.length === 0 || !currentPost.tags || currentPost.tags.length === 0) {
      return allPosts.filter((post) => post.slug !== currentPost.slug).slice(0, limit);
    }

    // Calculate matching tag count for each post
    const scoredPosts = candidates.map((post) => {
      const matchingTags = post.tags!.filter((tag) => currentPost.tags!.includes(tag));

      return {
        post,
        score: matchingTags.length,
      };
    });

    // Sort by matching tag count (desc) and then by date (newer first)
    const relatedPosts = scoredPosts
      .sort((a, b) => {
        // First sort by matching tag count
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        // Then sort by date if tag scores are equal
        return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
      })
      .map((item) => item.post)
      .slice(0, limit);

    return relatedPosts;
  } catch (error) {
    console.error("Error getting related posts:", error);
    return [];
  }
}

/**
 * Extracts headings from HTML content for table of contents
 * @param content - The HTML content string
 * @returns Array of heading objects with id, text, and level
 */
export function extractHeadingsFromContent(content: string): Heading[] {
  try {
    // Match h2 and h3 headings with IDs
    const headingRegex = /<h([2-3])(?:[^>]*id="([^"]+)"[^>]*)?>(.*?)<\/h\1>/g;
    const headings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      // If the heading doesn't have an ID, generate one from the content
      const level = parseInt(match[1]);
      const text = match[3].replace(/<[^>]*>/g, ""); // Strip any HTML tags inside heading
      let id = match[2];

      // If no ID found, generate one from the text content
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special chars
          .replace(/\s+/g, "-"); // Replace spaces with hyphens
      }

      headings.push({
        level,
        id,
        text,
      });
    }

    return headings;
  } catch (error) {
    console.error("Error extracting headings:", error);
    return [];
  }
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
    const featuredPosts = allPosts.filter((post) => post.featured);

    // Limit the number of posts if specified
    return limit ? featuredPosts.slice(0, limit) : featuredPosts;
  } catch (error) {
    console.error("Error getting featured posts:", error);
    return [];
  }
}
