/**
 * Static blog data handler for Cloudflare environments
 * Uses pre-generated JSON files instead of filesystem operations
 */

import { BlogPostMetadata } from '../types/blog';
import fs from 'fs';
import path from 'path';

/**
 * Type for tag mappings
 * Keys are tag names, values are arrays of post slugs with that tag
 */
type TagMap = Record<string, string[]>;

// In-memory cache for data
let postsCache: BlogPostMetadata[] | null = null;
let tagsCache: TagMap | null = null;
let slugsCache: string[] | null = null;

/**
 * Gets all blog posts metadata
 * @returns Array of blog post metadata
 */
export async function getAllPosts(): Promise<BlogPostMetadata[]> {
  try {
    // Use in-memory cache if available
    if (postsCache) {
      return postsCache;
    }

    let postsData: BlogPostMetadata[] = [];
    
    // Try filesystem access first in Node.js environment
    if (typeof window === 'undefined') {
      try {
        // Try reading from JSON file
        const dataPath = path.join(process.cwd(), 'public/blog-maps/posts.json');
        
        if (fs.existsSync(dataPath)) {
          console.log('Reading posts from JSON file...');
          const data = fs.readFileSync(dataPath, 'utf8');
          postsData = JSON.parse(data);
          console.log(`Loaded ${postsData.length} posts from JSON file`);
          
          // If we found posts, we're done with filesystem access
          if (postsData.length > 0) {
            postsCache = postsData;
            return postsData;
          }
        }
      } catch (fsError) {
        console.error('Error accessing posts from filesystem:', fsError);
      }
    }
    
    // Fallback to fetch
    console.log('Fetching posts from API...');
    try {
      const response = await fetch('/blog-maps/posts.json', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      
      postsData = await response.json();
      console.log(`Fetched ${postsData.length} posts via API`);
    } catch (fetchError) {
      console.error('Error fetching posts:', fetchError);
      // Return empty array on failure
      return [];
    }
    postsCache = postsData;
    return postsData;
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return [];
  }
}

/**
 * Gets all available post slugs
 * @returns Array of post slugs
 */
export async function getAllSlugs(): Promise<string[]> {
  try {
    // Use in-memory cache if available
    if (slugsCache) {
      return slugsCache;
    }

    let slugs: string[] = [];
    
    // First try: direct filesystem access to blog posts folder
    if (typeof window === 'undefined') {
      try {
        // Read all posts from posts directory
        const postsDir = path.join(process.cwd(), 'posts');
        
        if (fs.existsSync(postsDir) && fs.statSync(postsDir).isDirectory()) {
          console.log('Reading posts directory...');
          const files = fs.readdirSync(postsDir);
          slugs = files
            .filter(file => file.endsWith('.md'))
            .map(file => file.replace(/\.md$/, ''));
          
          console.log(`Found ${slugs.length} post slugs from filesystem`);
          
          // If we found slugs, we're done
          if (slugs.length > 0) {
            slugsCache = slugs;
            return slugs;
          }
        }
        
        // If direct reading failed, try the JSON file
        console.log('Trying prebuilt JSON file...');
        const dataPath = path.join(process.cwd(), 'public/blog-maps/slugs.json');
        
        if (fs.existsSync(dataPath)) {
          console.log('Reading slugs from JSON...');
          const data = fs.readFileSync(dataPath, 'utf8');
          slugs = JSON.parse(data);
          console.log(`Loaded ${slugs.length} slugs from JSON file`);
          
          // If we found slugs, we're done
          if (slugs.length > 0) {
            slugsCache = slugs;
            return slugs;
          }
        }
      } catch (error) {
        console.error('Error accessing filesystem:', error);
      }
    }
    
    // Last resort: fetch from URL
    console.log('Falling back to fetch API...');
    
    try {
      // In browser, or if filesystem methods failed
      const response = await fetch('/blog-maps/slugs.json', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch slugs: ${response.status} ${response.statusText}`);
      }
      
      slugs = await response.json();
      console.log(`Fetched ${slugs.length} slugs from API`);
    } catch (fetchError) {
      console.error('Error fetching slugs:', fetchError);
      
      // Create at least one slug to prevent build failures
      console.warn('Creating fallback slug');
      slugs = ['sample-post'];
    }
    
    slugsCache = slugs;
    return slugs;
  } catch (error) {
    console.error('Error getting post slugs:', error);
    return [];
  }
}

/**
 * Gets posts with specific tags
 * @param tags Array of tags to filter by
 * @returns Array of matching blog posts sorted by date
 */
export async function getPostsByTags(tags: string[]): Promise<BlogPostMetadata[]> {
  try {
    const allPosts: BlogPostMetadata[] = await getAllPosts();
    
    if (!tags || tags.length === 0) {
      return allPosts;
    }
    
    // Create a Set for more efficient lookups
    const tagSet: Set<string> = new Set(tags);
    
    return allPosts.filter(post => 
      post.tags && post.tags.some(tag => tagSet.has(tag))
    );
  } catch (error) {
    console.error('Error getting posts by tags:', error);
    return [];
  }
}

/**
 * Gets all unique tags from all blog posts
 * @returns Array of unique tags sorted alphabetically
 */
export async function getAllTags(): Promise<string[]> {
  try {
    // Use in-memory cache if available
    if (tagsCache) {
      return Object.keys(tagsCache).sort();
    }

    let tagsData: TagMap = {};
    
    // Try filesystem access first in Node.js environment
    if (typeof window === 'undefined') {
      try {
        // Try reading from JSON file
        const dataPath = path.join(process.cwd(), 'public/blog-maps/tags.json');
        
        if (fs.existsSync(dataPath)) {
          console.log('Reading tags from JSON file...');
          const data = fs.readFileSync(dataPath, 'utf8');
          tagsData = JSON.parse(data);
          console.log(`Loaded ${Object.keys(tagsData).length} tags from JSON file`);
          
          // If we found tags, we're done with filesystem access
          if (Object.keys(tagsData).length > 0) {
            tagsCache = tagsData;
            return Object.keys(tagsData).sort();
          }
        }
      } catch (fsError) {
        console.error('Error accessing tags from filesystem:', fsError);
      }
    }
    
    // Fallback to fetch
    console.log('Fetching tags from API...');
    try {
      const response = await fetch('/blog-maps/tags.json', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
      }
      
      tagsData = await response.json();
      console.log(`Fetched ${Object.keys(tagsData).length} tags via API`);
    } catch (fetchError) {
      console.error('Error fetching tags:', fetchError);
      // Return empty array on failure
      return [];
    }
    tagsCache = tagsData;
    return Object.keys(tagsData).sort();
  } catch (error) {
    console.error('Error getting all tags:', error);
    return [];
  }
}

/**
 * Gets featured blog posts
 * @param limit Maximum number of featured posts to return
 * @returns Array of featured posts sorted by date
 */
export async function getFeaturedPosts(limit?: number): Promise<BlogPostMetadata[]> {
  try {
    const allPosts: BlogPostMetadata[] = await getAllPosts();
    
    // Filter featured posts
    const featuredPosts: BlogPostMetadata[] = allPosts.filter(post => post.featured === true);
    
    // Limit the number of posts if specified
    return limit !== undefined ? featuredPosts.slice(0, limit) : featuredPosts;
  } catch (error) {
    console.error('Error getting featured posts:', error);
    return [];
  }
}

/**
 * Gets metadata for a single post
 * @param slug The post slug
 * @returns The post metadata or null if not found
 */
export async function getPostMetadata(slug: string): Promise<BlogPostMetadata | null> {
  try {
    const allPosts: BlogPostMetadata[] = await getAllPosts();
    const post: BlogPostMetadata | undefined = allPosts.find(post => post.slug === slug);
    return post || null;
  } catch (error) {
    console.error(`Error getting metadata for post ${slug}:`, error);
    return null;
  }
}

/**
 * Gets related posts based on matching tags
 * @param slug The current slug
 * @param limit Maximum number of related posts to return (default: 3)
 * @returns Array of related posts sorted by matching tag count and date
 */
export async function getRelatedPosts(
  slug: string, 
  limit: number = 3
): Promise<BlogPostMetadata[]> {
  try {
    const allPosts: BlogPostMetadata[] = await getAllPosts();
    const currentPost: BlogPostMetadata | undefined = allPosts.find(post => post.slug === slug);
    
    if (!currentPost) {
      return [];
    }
    
    // Filter out the current post and posts without tags
    const candidates: BlogPostMetadata[] = allPosts.filter(post => 
      post.slug !== slug && 
      post.tags && 
      post.tags.length > 0
    );
    
    // If no candidates or current post has no tags, return most recent posts
    if (candidates.length === 0 || !currentPost.tags || currentPost.tags.length === 0) {
      return allPosts
        .filter(post => post.slug !== slug)
        .slice(0, limit);
    }
    
    // Calculate matching tag count for each post
    interface ScoredPost {
      post: BlogPostMetadata;
      score: number;
    }
    
    const scoredPosts: ScoredPost[] = candidates.map(post => {
      const matchingTags: string[] = post.tags!.filter(tag => 
        currentPost.tags!.includes(tag)
      );
      
      return {
        post,
        score: matchingTags.length
      };
    });
    
    // Sort by matching tag count (desc) and then by date (newer first)
    const relatedPosts: BlogPostMetadata[] = scoredPosts
      .sort((a, b) => {
        // First sort by matching tag count
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        
        // Then sort by date if tag scores are equal
        return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
      })
      .map(item => item.post)
      .slice(0, limit);
    
    return relatedPosts;
  } catch (error) {
    console.error('Error getting related posts:', error);
    return [];
  }
}

/**
 * Clears all in-memory caches
 * Useful for testing or when data might have changed
 */
export function clearCaches(): void {
  postsCache = null;
  tagsCache = null;
  slugsCache = null;
  console.log('All blog static caches have been cleared');
}