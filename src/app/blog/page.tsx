import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllPosts } from "../lib/fs-blog";
import { BlogView } from "./components";
import { BlogListSkeleton } from "./components/shared/BlogListSkeleton";
import { JsonLd } from "../components/JsonLd";
import { buildBlogJsonLd } from "../lib/json-ld";
import { Post } from "../types/blog";

export const metadata: Metadata = {
  title: "Blog | witl.xyz",
  description: "Thoughts on DevOps, cloud-native infrastructure, and software supply chain security.",
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "witl.xyz Blog RSS" }],
    },
  },
};

// This async function leverages React Server Components to fetch data
async function getPosts(): Promise<Post[]> {
  try {
    // Use filesystem-based blog implementation
    const posts = await getAllPosts();

    return posts.map((post) => ({
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
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const allPosts = await getPosts();
  const metadataPosts = allPosts.map(({ slug, title, date, excerpt }) => ({
    slug,
    title,
    date,
    excerpt,
    readingTime: "",
    tags: [],
  }));

  return (
    <>
      <JsonLd data={buildBlogJsonLd(metadataPosts)} />
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogView
          posts={allPosts}
          initialSelectedTag={searchParams.tag}
          initialSearchQuery={searchParams.q ?? ""}
        />
      </Suspense>
    </>
  );
}
