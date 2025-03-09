import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, getRelatedPosts, extractHeadingsFromContent } from "../../lib/blog";
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
  } catch {
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
    const posts = await getAllPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Error generating static paths:", error);
    return [];
  }
}