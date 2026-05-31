import type { BlogPost, BlogPostMetadata } from "../types/blog";
import {
  GITHUB_USERNAME,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./site";

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
  };
}

export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    email: SITE_EMAIL,
    jobTitle: "DevOps Engineer",
    sameAs: [`https://github.com/${GITHUB_USERNAME}`],
  };
}

export function buildBlogPostingJsonLd(post: BlogPost | BlogPostMetadata) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: post.author?.name ?? SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(post.coverImage ? { image: post.coverImage } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
  };
}

export function buildBlogJsonLd(posts: BlogPostMetadata[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: `${SITE_URL}/blog`,
    description: "Thoughts on DevOps, cloud-native infrastructure, and software supply chain security.",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };
}
