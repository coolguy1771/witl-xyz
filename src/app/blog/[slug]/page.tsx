import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, getRelatedPosts } from "../../lib/fs-blog";
import { BlogPostView } from "../components";
import { BlogListSkeleton } from "../components/shared/BlogListSkeleton";

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
    // Load post from filesystem
    const post = await getPostBySlug(slug);
    
    // Get related posts
    const relatedPosts = await getRelatedPosts(post, 2);

    return (
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogPostView post={post} relatedPosts={relatedPosts} />
      </Suspense>
    );
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    notFound();
  }
}


// Generate static paths for build time
export async function generateStaticParams() {
  try {
    // Get all post slugs from the filesystem
    const slugs = getPostSlugs();
    
    if (slugs.length > 0) {
      console.log(`Found ${slugs.length} blog posts in filesystem`);
      return slugs.map(slug => ({ slug }));
    }
    
    // Fallback for empty directory
    console.warn("No blog posts found, using fallback");
    return [{ slug: 'sample-post' }];
  } catch (error) {
    console.error("Error generating static paths:", error);
    return [{ slug: 'sample-post' }];
  }
}