import { BlogPost } from "../types/blog";
import { BlogCard } from "../blog/components/listing/BlogCard";

interface BlogPostCardProps {
  post: BlogPost;
}

/** Blog post preview card — same component as /blog listing. */
export function BlogPostCard({ post }: BlogPostCardProps) {
  return <BlogCard post={post} />;
}
