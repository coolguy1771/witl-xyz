import { NextRequest, NextResponse } from "next/server";
import { fetchGithubProjectBySlug, isValidRepoSlug } from "@/app/lib/github";

export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    if (!isValidRepoSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const project = await fetchGithubProjectBySlug(slug);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error in /api/github/[slug]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
