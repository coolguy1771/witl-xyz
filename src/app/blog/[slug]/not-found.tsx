"use client";

import {
  useTheme,
} from "@mui/material";
import Link from "next/link";

export default function BlogPostNotFound() {

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
      <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/blog"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to blog
      </Link>
    </div>
  );
}
