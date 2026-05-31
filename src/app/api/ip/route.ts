import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const headersList = await headers();
  const ip =
    headersList.get("cf-connecting-ip") ??
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  return NextResponse.json({ ip });
}
