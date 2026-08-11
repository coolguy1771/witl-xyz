import { getAllPosts } from "@/app/lib/fs-blog";
import { NextResponse } from "next/server";

const SITE_URL = "https://witl.xyz";
const FEED_TITLE = "Tyler Witlin - Blog";
const FEED_DESC = "Blog posts by Tyler Witlin - DevOps Engineer specializing in Kubernetes, GitOps, CI/CD pipelines, and cloud-native infrastructure.";

export const revalidate = 3600; // ISR: regenerate every hour

async function rssItem(post: any) {
  const link = `${SITE_URL}/blog/${post.slug}`;
  const title = post.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const description = post.excerpt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
}

async function rssFeed(posts: any[]) {
  const items = await Promise.all(posts.map(rssItem));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${SITE_URL}/blog</link>
    <description>${FEED_DESC}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items.join("")}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    const posts = await getAllPosts();
    const feed = await rssFeed(posts);

    return new NextResponse(feed, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Unable to generate feed", { status: 500 });
  }
}
