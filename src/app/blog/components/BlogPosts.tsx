'use client';

import Link from "next/link";
import { BlogPost } from "../../types/blog";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, slideInFromLeft } from "../../lib/animations";

interface BlogPostsProps {
  posts: BlogPost[];
}

export default function BlogPostsClient({ posts }: BlogPostsProps) {
  return (
    <motion.div
      className="min-h-screen bg-background text-foreground pt-24"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-4xl mx-auto px-6">
        <motion.h1
          className="text-4xl font-bold mb-8"
          variants={slideInFromLeft}
        >
          Blog
        </motion.h1>
        <motion.div 
          className="space-y-12" 
          variants={staggerContainer}
        >
          {posts.map((post) => (
            <motion.article
              key={post.slug}
              className="group"
              variants={fadeIn}
              whileHover={{ y: -5 }}
            >
              <Link href={`/blog/${post.slug}`} className="block space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold group-hover:text-gray-300 transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
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
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
