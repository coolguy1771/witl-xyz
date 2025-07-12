import { NextResponse } from "next/server";
import { getAllTags } from "@/app/lib/fs-blog";

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error in /api/blog/tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog tags" },
      { status: 500 }
    );
  }
}
