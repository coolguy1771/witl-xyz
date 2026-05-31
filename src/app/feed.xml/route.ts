import { getAllPosts } from "@/app/lib/fs-blog";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/app/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllPosts();
  const buildDate = posts[0]?.date ?? new Date().toISOString();

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${link}</link>`,
        `<guid isPermaLink="true">${link}</guid>`,
        `<pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        `<description>${escapeXml(post.excerpt)}</description>`,
        "</item>",
      ].join("");
    })
    .join("");

  const feed = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(`${SITE_NAME} Blog`)}</title>`,
    `<link>${SITE_URL}/blog</link>`,
    `<description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    `<language>en-us</language>`,
    `<lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>`,
    `<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
