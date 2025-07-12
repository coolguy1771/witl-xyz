import { readFile, readdir } from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { cache } from "react";
import { BlogPost } from "../types/blog";
import fs from "fs";
import { remark } from "remark";
import html from "remark-html";

interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  readingTime: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
}

// 📌 Cached function to fetch all blog posts
export const getAllPosts = cache((): Post[] => {
  const postsDirectory = path.join(process.cwd(), "posts");
  const files = fs.readdirSync(postsDirectory);

  const posts = files
    .filter(file => file.endsWith(".md"))
    .map(file => {
      const fileContent = fs.readFileSync(
        path.join(postsDirectory, file),
        "utf8"
      );
      const { data, content } = matter(fileContent);

      return {
        slug: file.replace(/\.md$/, ""),
        title: data.title,
        date: data.date,
        content,
        readingTime: `${Math.ceil(
          content.split(/\s+/g).length / 200
        )} min read`,
        excerpt: data.excerpt || content.slice(0, 160) + "...",
        author: data.author,
        tags: data.tags || [],
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
});

export const processMarkdown = cache(async (content: string) => {
  const result = await remark().use(html, { sanitize: false }).process(content);

  let htmlContent = result.toString();

  // Add IDs to headings
  htmlContent = htmlContent.replace(
    /<h([23])(.*?)>(.*?)<\/h\1>/g,
    (match, level, attrs, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `<h${level}${attrs || ""} id="${id}">${text}</h${level}>`;
    }
  );

  return htmlContent;
});

// 📌 Get next/previous post for navigation
export function getPostNavigation(slug: string) {
  const posts = getAllPosts();
  const currentIndex = posts.findIndex(post => post.slug === slug);

  return {
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}

export const getPosts = cache(async (): Promise<BlogPost[]> => {
  const postsDirectory = path.join(process.cwd(), "./posts");

  try {
    const filenames = await readdir(postsDirectory);

    const posts = await Promise.all(
      filenames
        .filter(file => file.endsWith(".md"))
        .map(async filename => {
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
            content,
            excerpt: data.excerpt || content.slice(0, 150) + "...",
            readingTime,
          };
        })
    );

    return posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return [];
  }
});
