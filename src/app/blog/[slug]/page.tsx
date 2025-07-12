import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getRelatedPosts,
  getPostSlugs,
  getAllTags,
} from "@/app/lib/blog-cf";
import { BlogPost } from "@/app/types/blog";
import {
  PostContent,
  RelatedPosts,
  TableOfContents,
  TagCloud,
} from "@/app/components/blog";
import Image from "next/image";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const slug = await Promise.resolve(params.slug);

  try {
    const post = await getPostBySlug(slug);

    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.date,
        authors: post.author ? [post.author] : undefined,
        tags: post.tags,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    };
  } catch {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(slug => ({
    slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const slug = await Promise.resolve(params.slug);
  let post: BlogPost;
  let relatedPosts: BlogPost[] = [];
  let allTags: string[] = [];

  try {
    // Fetch post, related posts, and tags in parallel
    const [fetchedPost, fetchedRelated, fetchedTags] = await Promise.all([
      getPostBySlug(slug),
      getRelatedPosts(await getPostBySlug(slug)),
      getAllTags(),
    ]);

    post = fetchedPost;
    relatedPosts = fetchedRelated;
    allTags = fetchedTags;
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <article className="prose dark:prose-invert max-w-none flex-1">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {post.author && <span>By {post.author}</span>}
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString()}
            </time>
            <span>{post.readingTime}</span>
          </div>
            <Image
              src={post.coverImage || "/default-cover.jpg"}
              alt={post.title}
              width={1200}
              height={400}
              className="w-full h-64 object-cover rounded-lg mt-4"
              priority={false}
            />
        </header>

        <PostContent content={post.content} />

        {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
      </article>

      <aside className="w-full lg:w-64 space-y-8">
        <TableOfContents
          headings={
            post.content.match(/<h[2-3][^>]*>.*?<\/h[2-3]>/g)?.map(heading => {
              const level = heading.startsWith("<h2") ? 2 : 3;
              const text = heading.replace(/<[^>]*>/g, "");
              const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-");
              return { id, text, level };
            }) || []
          }
          className="sticky top-8"
        />

        <TagCloud tags={allTags} className="sticky top-8" />
      </aside>
    </div>
  );
}
