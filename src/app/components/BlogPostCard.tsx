import Link from "next/link";
import { motion } from "framer-motion";
import { BlogPost } from "../types";
import { fadeIn } from "../lib/animations";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <motion.article className="group" variants={fadeIn} whileHover={{ y: -5 }}>
      <Link href={`/blog/${post.slug}`} className="block space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold group-hover:text-gray-300 transition-colors">
            {post.title}
          </h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString()}
            </time>
            <span>{post.readingTime}</span>
          </div>
        </div>
        <p className="text-gray-400 line-clamp-2">{post.excerpt}</p>
        <motion.span
          className="inline-block text-sm text-gray-400 group-hover:text-gray-300 transition-colors"
          whileHover={{ x: 5 }}
        >
          Read more →
        </motion.span>
      </Link>
    </motion.article>
  );
}
