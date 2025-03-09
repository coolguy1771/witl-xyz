'use client';

import { useState, useEffect } from 'react';

export function useBlogTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/blog/tags');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.status}`);
        }
        
        const data = await response.json();
        setTags(data);
      } catch (err: any) {
        console.error('Error fetching blog tags:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  return {
    tags,
    isLoading,
    error,
  };
}