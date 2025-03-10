import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, getRelatedPosts, extractHeadingsFromContent } from "../../lib/blog";
import { promises as fs } from "fs";
import path from "path";
import { BlogPostView } from "../components";
import { BlogListSkeleton } from "../components/shared/BlogListSkeleton";
import { BlogPost } from "../../types/blog";

// Generate metadata for the page
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  // Wait for params to be available and then destructure
  const slug = params?.slug;

  try {
    const post = await getPostBySlug(slug);
    
    return {
      title: `${post.title} | My Blog`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.date,
        ...(post.coverImage && { images: [{ url: post.coverImage }] }),
        ...(post.author && { authors: [post.author.name] }),
      },
    };
  } catch (error) {
    console.error("Error generating metadata", error);
    return {
      title: 'Post Not Found | My Blog',
      description: 'The requested blog post could not be found.',
    };
  }
}


export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  // Wait for params to be available and then access slug
  const slug = params?.slug;

  try {
    const post = await getPostBySlug(slug) as BlogPost;

    if (!post.headings) {
      post.headings = extractHeadingsFromContent(post.content);
    }

    const relatedPosts = await getRelatedPosts(post, 2);

    return (
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogPostView post={post} relatedPosts={relatedPosts} />
      </Suspense>
    );
  } catch {
    notFound();
  }
}


// Generate static paths for build time
export async function generateStaticParams() {
  try {
    // Directly access the filesystem during build to get slugs
    const postsDir = path.join(process.cwd(), 'posts');
    
    try {
      // Check if directory exists first
      const stat = await fs.stat(postsDir);
      if (!stat.isDirectory()) {
        throw new Error('Posts directory not found');
      }
      
      // Read files from directory
      const files = await fs.readdir(postsDir);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      // Create slug params from filenames
      return markdownFiles.map(filename => ({
        slug: filename.replace(/\.md$/, ''),
      }));
    } catch (fsError) {
      // Fallback to blog API method if filesystem access fails
      console.error("Filesystem access failed, falling back to API:", fsError);
      const posts = await getAllPosts();
      return posts.map((post) => ({
        slug: post.slug,
      }));
    }
  } catch (error) {
    console.error("Error generating static paths:", error);
    return [];
  }
}