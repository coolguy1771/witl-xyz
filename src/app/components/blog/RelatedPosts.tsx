import Link from "next/link";
import { BlogPost } from "@/app/types/blog";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <article
            key={post.slug}
            className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {post.coverImage && (
              <div className="relative h-48">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-semibold mb-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {post.excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString()}
                </time>
                <span>{post.readingTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
