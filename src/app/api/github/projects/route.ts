import { NextRequest, NextResponse } from "next/server";
import { fetchGithubProjects } from "@/app/lib/github";
import { cachedJson } from "@/app/lib/edge-cache";
import { readProjectsSnapshot } from "@/app/lib/github-snapshot";

export const dynamic = "force-dynamic";

const DEFAULT_USERNAME = "coolguy1771";
const MAX_LIMIT = 20;

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 6, 1), MAX_LIMIT) : 6;

  // fetchGithubProjects swallows errors and returns [], so don't cache empties.
  let projects = await cachedJson(
    `github-projects:${DEFAULT_USERNAME}:${limit}`,
    3600,
    () => fetchGithubProjects(DEFAULT_USERNAME, limit),
    (result) => result.length > 0
  );

  // Live fetch failed (rate limit, outage): serve the last cron snapshot.
  if (projects.length === 0) {
    projects = (await readProjectsSnapshot()).slice(0, limit);
  }

  return NextResponse.json(projects, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
