"use client";

import Link from "next/link";
import { useMemo } from "react";

interface TagCloudProps {
  tags: string[];
  className?: string;
}

export function TagCloud({ tags, className = "" }: TagCloudProps) {
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, [tags]);

  const maxCount = Math.max(...Object.values(tagCounts));
  const minCount = Math.min(...Object.values(tagCounts));

  const getTagSize = (count: number) => {
    if (maxCount === minCount) return "text-base";
    const normalized = (count - minCount) / (maxCount - minCount);
    const sizeClasses = ["text-sm", "text-base", "text-lg", "text-xl", "text-2xl"];
    const index = Math.floor(normalized * (sizeClasses.length - 1));
    return sizeClasses[index];
  };

  if (tags.length === 0) return null;

  return (
    <div className={`tag-cloud ${className}`}>
      <h2 className="text-lg font-semibold mb-4">Tags</h2>
      <div className="flex flex-wrap gap-2">
        {Object.entries(tagCounts).map(([tag, count]) => (
          <Link
            key={tag}
            href={`/blog/tags/${tag}`}
            className={`
              inline-block px-3 py-1 rounded-full
              bg-gray-100 dark:bg-gray-800
              hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors
              ${getTagSize(count)}
            `}
          >
            {tag}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              ({count})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
