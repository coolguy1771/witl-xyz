import { NextRequest, NextResponse } from "next/server";
import { fetchGithubProjects } from "@/app/lib/github";

export const revalidate = 3600;

const DEFAULT_USERNAME = "coolguy1771";
const MAX_LIMIT = 20;

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam
    ? Math.min(Math.max(parseInt(limitParam, 10) || 6, 1), MAX_LIMIT)
    : 6;

  const projects = await fetchGithubProjects(DEFAULT_USERNAME, limit);

  return NextResponse.json(projects, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
