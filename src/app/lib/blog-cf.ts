// import { BlogPost, BlogPostMetadata, Heading } from '../types/blog';

// // In-memory cache for blog posts
// const postCache = new Map<string, BlogPost>();
// let postsCache: BlogPostMetadata[] | null = null;
// let tagsCache: string[] | null = null;

// /**
//  * Gets all blog posts metadata
//  * @returns Array of blog post metadata
//  */
// export async function getAllPosts(): Promise<BlogPostMetadata[]> {
//   try {
//     // Use in-memory cache if available
//     if (postsCache) {
//       return postsCache;
//     }

//     // For local development fallback to pre-built JSON
//     if (typeof window !== 'undefined' || !('BLOG_POSTS' in (process.env as any))) {
//       const postsData = await fetch('/blog-data/posts.json').then(res => res.json());
//       postsCache = postsData as BlogPostMetadata[];
//       return postsData as BlogPostMetadata[];
//     }

//     // For Cloudflare environment
//     const env = process.env as unknown as CloudflareEnv;
    
//     // Try KV first
//     if (env.BLOG_POSTS) {
//       const postsData = await env.BLOG_POSTS.get('posts', 'json') as BlogPostMetadata[];
//       if (postsData) {
//         postsCache = postsData;
//         return postsData as BlogPostMetadata[];
//       }
//     }
    
//     // Fallback to Assets (static JSON)
//     const postsData = await fetch('/blog-data/posts.json', {
//       headers: { 'Accept': 'application/json' }
//     }).then(res => res.json());
    
//     postsCache = postsData as BlogPostMetadata[];
//     return postsData as BlogPostMetadata[];
//   } catch (error) {
//     console.error('Error getting blog posts:', error);
//     return [];
//   }
// }

// /**
//  * Gets a blog post by slug
//  * @param slug The post slug
//  * @returns The blog post data
//  */
// export async function getPostBySlug(slug: string): Promise<BlogPost> {
//   try {
//     // Use in-memory cache if available
//     if (postCache.has(slug)) {
//       return postCache.get(slug)!;
//     }

//     // For local development fallback to pre-built JSON
//     if (typeof window !== 'undefined' || !('BLOG_POSTS' in (process.env as any))) {
//       const post = await fetch(`/blog-data/${slug}.json`).then(res => {
//         if (!res.ok) {
//           throw new Error(`Post not found: ${slug}`);
//         }
//         return res.json();
//       });
      
//       postCache.set(slug, post as BlogPost);
//       return post as BlogPost;
//     }

//     // For Cloudflare environment
//     const env = process.env as unknown as CloudflareEnv;
    
//     // Try KV first
//     if (env.BLOG_POSTS) {
//       const post = await env.BLOG_POSTS.get(`post:${slug}`, 'json') as BlogPost;
//       if (post) {
//         postCache.set(slug, post as BlogPost);
//         return post as BlogPost;
//       }
//     }
    
//     // Fallback to Assets (static JSON)
//     const post = await fetch(`/blog-data/${slug}.json`, {
//       headers: { 'Accept': 'application/json' }
//     }).then(res => {
//       if (!res.ok) {
//         throw new Error(`Post not found: ${slug}`);
//       }
//       return res.json();
//     });
    
//     postCache.set(slug, post);
//     return post;
//   } catch (error) {
//     console.error(`Error getting post ${slug}:`, error);
//     throw error;
//   }
// }

// /**
//  * Gets posts with specific tags
//  * @param tags Array of tags to filter by
//  * @returns Array of matching blog posts sorted by date
//  */
// export async function getPostsByTags(tags: string[]): Promise<BlogPostMetadata[]> {
//   try {
//     const allPosts = await getAllPosts();
    
//     if (!tags || tags.length === 0) {
//       return allPosts;
//     }
    
//     return allPosts.filter(post => 
//       post.tags && post.tags.some(tag => tags.includes(tag))
//     );
//   } catch (error) {
//     console.error('Error getting posts by tags:', error);
//     return [];
//   }
// }

// /**
//  * Gets all unique tags from all blog posts
//  * @returns Array of unique tags sorted alphabetically
//  */
// export async function getAllTags(): Promise<string[]> {
//   try {
//     // Use in-memory cache if available
//     if (tagsCache) {
//       return tagsCache;
//     }

//     // For local development fallback to pre-built JSON
//     if (typeof window !== 'undefined' || !('BLOG_POSTS' in (process.env as any))) {
//       const tagsData = await fetch('/blog-data/tags.json').then(res => res.json());
//       tagsCache = Object.keys(tagsData as Record<string, any>).sort();
//       return tagsCache;
//     }

//     // For Cloudflare environment
//     const env = process.env as unknown as CloudflareEnv;
    
//     // Try KV first
//     if (env.BLOG_POSTS) {
//       const tagsData = await env.BLOG_POSTS.get('tags', 'json') as Record<string, string[]>;
//       if (tagsData) {
//         tagsCache = Object.keys(tagsData as Record<string, any>).sort();
//         return tagsCache;
//       }
//     }
    
//     // Fallback to Assets (static JSON)
//     const tagsData = await fetch('/blog-data/tags.json', {
//       headers: { 'Accept': 'application/json' }
//     }).then(res => res.json());
    
//     tagsCache = Object.keys(tagsData).sort();
//     return tagsCache;
//   } catch (error) {
//     console.error('Error getting all tags:', error);
//     return [];
//   }
// }

// /**
//  * Gets featured blog posts
//  * @param limit Maximum number of featured posts to return
//  * @returns Array of featured posts sorted by date
//  */
// export async function getFeaturedPosts(limit?: number): Promise<BlogPostMetadata[]> {
//   try {
//     const allPosts = await getAllPosts();
    
//     // Filter featured posts
//     const featuredPosts = allPosts.filter(post => post.featured);
    
//     // Limit the number of posts if specified
//     return limit ? featuredPosts.slice(0, limit) : featuredPosts;
//   } catch (error) {
//     console.error('Error getting featured posts:', error);
//     return [];
//   }
// }

// /**
//  * Gets related posts based on matching tags
//  * @param currentSlug The current blog post slug
//  * @param limit Maximum number of related posts to return (default: 3)
//  * @returns Array of related posts sorted by matching tag count and date
//  */
// export async function getRelatedPosts(
//   currentSlug: string, 
//   limit: number = 3
// ): Promise<BlogPostMetadata[]> {
//   try {
//     // Get current post to get its tags
//     const currentPost = await getPostBySlug(currentSlug);
    
//     // Get all posts
//     const allPosts = await getAllPosts();
    
//     // Filter out the current post and posts without tags
//     const candidates = allPosts.filter(post => 
//       post.slug !== currentSlug && 
//       post.tags && 
//       post.tags.length > 0
//     );
    
//     // If no candidates or current post has no tags, return most recent posts
//     if (candidates.length === 0 || !currentPost.tags || currentPost.tags.length === 0) {
//       return allPosts
//         .filter(post => post.slug !== currentSlug)
//         .slice(0, limit);
//     }
    
//     // Calculate matching tag count for each post
//     const scoredPosts = candidates.map(post => {
//       const matchingTags = post.tags!.filter(tag => 
//         currentPost.tags!.includes(tag)
//       );
      
//       return {
//         post,
//         score: matchingTags.length
//       };
//     });
    
//     // Sort by matching tag count (desc) and then by date (newer first)
//     const relatedPosts = scoredPosts
//       .sort((a, b) => {
//         // First sort by matching tag count
//         if (b.score !== a.score) {
//           return b.score - a.score;
//         }
        
//         // Then sort by date if tag scores are equal
//         return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
//       })
//       .map(item => item.post)
//       .slice(0, limit);
    
//     return relatedPosts;
//   } catch (error) {
//     console.error('Error getting related posts:', error);
//     return [];
//   }
// }

// /**
//  * Clears all in-memory caches
//  */
// export function clearCaches(): void {
//   postCache.clear();
//   postsCache = null;
//   tagsCache = null;
// }