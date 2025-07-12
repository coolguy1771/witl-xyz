import { Suspense } from "react";
import { getAllPosts } from "../lib/fs-blog";
import { BlogView } from "./components";
import { BlogListSkeleton } from "./components/shared/BlogListSkeleton";
import { Post } from "../types/blog";

// This async function leverages React Server Components to fetch data
async function getPosts(): Promise<Post[]> {
  try {
    // Use filesystem-based blog implementation
    const posts = await getAllPosts();

    return posts.map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      readingTime: post.readingTime,
      tags: post.tags || [],
      coverImage: post.coverImage,
      content: post.content,
    }));
  } catch (error) {
    console.error("Error loading blog posts:", error);
    throw new Error("Failed to load blog posts");
  }
}

export default async function BlogPage(props: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Get posts data on the server
  const allPosts = await getPosts();

  return (
    <Suspense fallback={<BlogListSkeleton />}>
      <BlogView posts={allPosts} initialSelectedTag={searchParams.tag} />
    </Suspense>
  );
}
