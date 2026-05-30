import { NextRequest, NextResponse } from "next/server";
import { fetchGithubProjects } from "@/app/lib/github";

export const revalidate = 3600;

const DEFAULT_USERNAME = "coolguy1771";
const MAX_LIMIT = 20;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username") ?? DEFAULT_USERNAME;
  const limitParam = searchParams.get("limit");
  const limit = limitParam
    ? Math.min(Math.max(parseInt(limitParam, 10) || 6, 1), MAX_LIMIT)
    : 6;

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  const projects = await fetchGithubProjects(username, limit);

  return NextResponse.json(projects, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
