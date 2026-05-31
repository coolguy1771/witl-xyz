import type { MetadataRoute } from "next";
import { getAllPosts } from "./lib/fs-blog";
import { getNowPageUpdatedAt } from "./lib/fs-now";
import { SITE_URL } from "./lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const nowUpdatedAt = await getNowPageUpdatedAt();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/now`, lastModified: nowUpdatedAt, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/status`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/you`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
