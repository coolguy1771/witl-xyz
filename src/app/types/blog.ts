/**
 * Represents the front matter data in markdown blog posts
 */
export interface BlogPostFrontMatter {
  /** The title of the blog post */
  title: string;

  /** Publication date in ISO format (YYYY-MM-DD) or any parseable date string */
  date: string;

  /** Optional short summary of the post - will be auto-generated if not provided */
  excerpt?: string;

  /** Optional array of tags/categories for the post */
  tags?: string[];

  /** Optional URL to a cover/featured image */
  coverImage?: string;

  /** Optional boolean to feature this post */
  featured?: boolean;

  /** Optional author information */
  author?: {
    name: string;
    avatar?: string;
  };
}

/**
 * Represents a heading in the blog post content
 */
export interface Heading {
  /** The unique ID of the heading (typically the slugified text) */
  id: string;

  /** The heading text content */
  text: string;

  /** The heading level (1 for h1, 2 for h2, etc.) */
  level: number;
}

/**
 * Represents a complete blog post with content and metadata
 */
export interface BlogPost {
  /** URL-friendly identifier for the post */
  slug: string;

  /** The title of the blog post */
  title: string;

  /** Publication date */
  date: string;

  /** HTML content of the post */
  content: string;

  /** Short summary of the post */
  excerpt: string;

  /** Estimated reading time */
  readingTime: string;

  /** Array of tags/categories */
  tags: string[];

  /** Optional URL to a cover/featured image */
  coverImage?: string;

  /** Optional boolean indicating if this is a featured post */
  featured?: boolean;

  /** Optional author information */
  author?: {
    name: string;
    avatar?: string;
  };

  /** Optional array of headings extracted from the content */
  headings?: Heading[];
}

/**
 * Represents just the metadata of a blog post (for listings)
 * Omits the content and headings fields from BlogPost
 */
export interface BlogPostMetadata {
  /** URL-friendly identifier for the post */
  slug: string;

  /** The title of the blog post */
  title: string;

  /** Publication date */
  date: string;

  /** Short summary of the post */
  excerpt: string;

  /** Estimated reading time */
  readingTime: string;

  /** Array of tags/categories */
  tags: string[];

  /** Optional URL to a cover/featured image */
  coverImage?: string;

  /** Optional boolean indicating if this is a featured post */
  featured?: boolean;

  /** Optional author information */
  author?: {
    name: string;
    avatar?: string;
  };
}

// Type alias for compatibility with existing code
export type Post = BlogPost;
