// app/types/blog.ts
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  readingTime: string;
}

export interface BlogPostMetadata {
  title: string;
  date: string;
  excerpt?: string;
}