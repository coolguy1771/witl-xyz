import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/app/lib/fs-blog";
import { searchPosts } from "@/app/lib/blog-search";

export const revalidate = 3600;

const MAX_QUERY_LENGTH = 100;

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (!query) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    const allPosts = await getAllPosts();
    const results = searchPosts(allPosts, query).map((post) => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      readingTime: post.readingTime,
      tags: post.tags,
      coverImage: post.coverImage,
    }));

    return NextResponse.json({ query, results, count: results.length });
  } catch (error) {
    console.error("Error in /api/blog/search:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
