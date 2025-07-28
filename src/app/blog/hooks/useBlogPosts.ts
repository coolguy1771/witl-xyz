"use client";

import { useState, useEffect } from "react";
import { Post } from "@/app/types/blog";

/**
 * Options for filtering and pagination of blog posts
 * @interface UseBlogPostsOptions
 * @property {string[]} [tags] - Filter posts by one or more tags
 * @property {number} [limit] - Maximum number of posts to return
 * @property {boolean} [featured] - Whether to only return featured posts
 */
interface UseBlogPostsOptions {
  tags?: string[];
  limit?: number;
  featured?: boolean;
}

/**
 * Custom hook for fetching and filtering blog posts
 *
 * Handles loading states, error handling, and filtering based on provided options.
 * Uses the /api/blog/posts endpoint with appropriate query parameters.
 *
 * @param {UseBlogPostsOptions} options - Configuration options for filtering posts
 * @returns {Object} Object containing posts array, loading state, and error state
 *
 * @example
 * const { posts, isLoading, error } = useBlogPosts({
 *   tags: ['react', 'typescript'],
 *   limit: 5,
 *   featured: true
 * });
 */
export function useBlogPosts(options: UseBlogPostsOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    /**
     * Fetches blog posts based on the current options
     * Handles loading states and error conditions
     */
    const fetchPosts = async () => {
      // Start loading and reset any previous errors
      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters from options
        const queryParams = new URLSearchParams();

        // Add tag filtering if specified
        if (options.tags && options.tags.length > 0) {
          queryParams.append("tags", options.tags.join(","));
        }

        // Add pagination limit if specified
        if (options.limit) {
          queryParams.append("limit", options.limit.toString());
        }

        // Add featured filter if specified
        if (options.featured !== undefined) {
          queryParams.append("featured", options.featured.toString());
        }

        // Create the query string for the API request
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

        // Fetch posts from the API
        const response = await fetch(`/api/blog/posts${queryString}`);

        // Handle HTTP error responses
        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        // Parse and store the response data
        const data = (await response.json()) as Post[];
        setPosts(data);
      } catch (err: Error | unknown) {
        console.error("Error fetching blog posts:", err);
        setError(err as Error);
      } finally {
        // Always set loading to false, regardless of success or failure
        setIsLoading(false);
      }
    };

    // Execute the fetch function
    fetchPosts();
  }, [options]);

  return {
    posts,
    isLoading,
    error,
  };
}
