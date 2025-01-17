import { getPostBySlug, getAllPosts } from "../../lib/blog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24">
      <article className="max-w-3xl mx-auto px-6">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to blog
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex gap-4 text-sm text-gray-400">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString()}
            </time>
            <span>{post.readingTime}</span>
          </div>
        </header>

        <div
          className="prose prose-invert max-w-none prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
