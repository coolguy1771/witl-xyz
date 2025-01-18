// app/blog/[slug]/page.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from 'next';
import { TableOfContents } from "../components/TableOfContents";
// import { CodeBlock } from "../components/CodeBlock";

type Params = Promise<{ slug: string }>;

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

async function processMarkdown(content: string) {
  const result = await remark()
    .use(html, { sanitize: false })
    .process(content);
    
  let htmlContent = result.toString();
  
  // Add IDs to headings
  htmlContent = htmlContent.replace(/<h([23])(.*?)>(.*?)<\/h\1>/g, (match, level, attrs, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `<h${level}${attrs || ''} id="${id}">${text}</h${level}>`;
  });

  // Wrap code blocks with our component
  htmlContent = htmlContent.replace(
    /<pre><code class="language-(\w+)">(.*?)<\/code><\/pre>/gs,
    (_, lang, code) => `<div data-code-block data-language="${lang}">${code}</div>`
  );

  return htmlContent;
}

function getAllPosts(): Post[] {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const files = fs.readdirSync(postsDirectory);

  const posts = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const fileContent = fs.readFileSync(path.join(postsDirectory, file), 'utf8');
      const { data, content } = matter(fileContent);
      
      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        content,
        readingTime: `${Math.ceil(content.split(/\s+/g).length / 200)} min read`,
        excerpt: data.excerpt || content.slice(0, 160) + '...',
        author: data.author,
        tags: data.tags || [],
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

function getPostNavigation(slug: string) {
  const posts = getAllPosts();
  const currentIndex = posts.findIndex(post => post.slug === slug);
  
  return {
    prev: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getAllPosts().find(p => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getAllPosts().find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const content = await processMarkdown(post.content);
  const { prev, next } = getPostNavigation(slug);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-8">
        <article>
          <Link 
            href="/blog" 
            className="inline-flex items-center text-gray-400 hover:text-gray-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to all posts
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-400">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
              <span>{post.readingTime}</span>
              {post.author && (
                <span>by {post.author}</span>
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {post.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div 
            className="prose prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent"
            dangerouslySetInnerHTML={{ __html: content }} 
          />

          <nav className="mt-16 pt-8 border-t border-gray-800 grid grid-cols-2 gap-4">
            {prev && (
              <Link
                href={`/blog/${prev.slug}`}
                className="group flex flex-col"
              >
                <span className="text-sm text-gray-400 flex items-center mb-2">
                  <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Previous
                </span>
                <span className="text-lg font-medium group-hover:text-gray-300">
                  {prev.title}
                </span>
              </Link>
            )}
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="group flex flex-col ml-auto text-right"
              >
                <span className="text-sm text-gray-400 flex items-center justify-end mb-2">
                  Next
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="text-lg font-medium group-hover:text-gray-300">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="hidden lg:block">
          <TableOfContents content={content} />
        </aside>
      </div>
    </div>
  );
}