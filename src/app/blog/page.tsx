import { Suspense } from "react";
import { readFile, readdir } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import BlogPostsClient from "./components/BlogPosts";
import Loading from "./loading";
import { BlogPost } from "../types/blog";

async function getPosts(): Promise<BlogPost[]> {
  // Get posts from the posts directory
  const postsDirectory = path.join(process.cwd(), "./posts");

  try {
    // Use readdir instead of readFile to get the list of files
    const filenames = await readdir(postsDirectory);

    const posts = await Promise.all(
      filenames
        .filter((file) => file.endsWith(".md"))
        .map(async (filename) => {
          const filePath = path.join(postsDirectory, filename);
          const fileContents = await readFile(filePath, "utf8");
          const { data, content } = matter(fileContents);

          // Calculate reading time
          const wordsPerMinute = 200;
          const wordCount = content.split(/\s+/g).length;
          const readingTime = `${Math.ceil(
            wordCount / wordsPerMinute
          )} min read`;

          return {
            slug: filename.replace(/\.md$/, ""),
            title: data.title,
            date: data.date,
            content: content,
            excerpt: data.excerpt || content.slice(0, 150) + "...",
            readingTime,
          };
        })
    );

    // Sort posts by date
    return posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error loading blog posts:", error);
    throw new Error("Failed to load blog posts");
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <Suspense fallback={<Loading />}>
      <BlogPostsClient posts={posts} />
    </Suspense>
  );
}
