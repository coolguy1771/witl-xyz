import { NextRequest, NextResponse } from "next/server";
import { getCfEnv } from "@/app/lib/cloudflare";

export const dynamic = "force-dynamic";

const SAFE_KEY = /^[A-Za-z0-9._\-/]+$/;

/**
 * Serves blog media from the MEDIA R2 bucket: /media/<key>.
 * Upload with: wrangler r2 object put witl-xyz-media/<key> --file <path>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const bucket = getCfEnv()?.MEDIA;
  const key = (await params).key.join("/");

  // snapshots/ holds internal cron output, not public media.
  if (!bucket || !SAFE_KEY.test(key) || key.includes("..") || key.startsWith("snapshots/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const object = await bucket.get(key, {
    onlyIf: request.headers,
    range: request.headers,
  });
  if (!object) return new NextResponse("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");

  // `onlyIf` miss returns metadata without a body -> 304
  if (!("body" in object)) {
    return new NextResponse(null, { status: 304, headers });
  }
  return new NextResponse(object.body, {
    status: request.headers.has("range") ? 206 : 200,
    headers,
  });
}
