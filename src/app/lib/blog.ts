import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { BlogPost, BlogPostFrontMatter } from '../types';

const postsDirectory = path.join(process.cwd(), 'posts');

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Use gray-matter to parse the post metadata section
  const { data, content } = matter(fileContents);
  const frontMatter = data as BlogPostFrontMatter;

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(content);
  const contentHtml = processedContent.toString();

  // Calculate reading time
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/g).length;
  const readingTime = `${Math.ceil(wordCount / wordsPerMinute)} min read`;

  // Validate and ensure all required fields are present
  if (!frontMatter.title || !frontMatter.date) {
    throw new Error(`Missing required fields in ${slug}`);
  }

  return {
    slug: realSlug,
    title: frontMatter.title,
    date: frontMatter.date,
    content: contentHtml,
    excerpt: frontMatter.excerpt || content.slice(0, 150) + '...',
    readingTime,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  // Get all post slugs
  const slugs = fs.readdirSync(postsDirectory);
  
  // Get all posts data
  const posts = await Promise.all(
    slugs
      .filter(slug => slug.endsWith('.md'))
      .map(slug => getPostBySlug(slug))
  );

  // Sort posts by date in descending order
  return posts.sort((post1, post2) => 
    new Date(post2.date).getTime() - new Date(post1.date).getTime()
  );
}

export async function getPostSlugs(): Promise<string[]> {
  return fs.readdirSync(postsDirectory)
    .filter(filename => filename.endsWith('.md'))
    .map(filename => filename.replace(/\.md$/, ''));
}