import { NextRequest, NextResponse } from "next/server";
import { getCfEnv } from "@/app/lib/cloudflare";

export const dynamic = "force-dynamic";

const SAFE_KEY = /^[A-Za-z0-9._\-/]+$/;

function etagList(header: string | null): string[] {
  return (header ?? "").split(",").map((tag) => tag.trim().replace(/^W\//, ""));
}

/** True when If-Match / If-Unmodified-Since reject the stored object (412). */
function failsWritePrecondition(request: NextRequest, object: R2Object): boolean {
  const ifMatch = request.headers.get("if-match");
  if (ifMatch) {
    // RFC 9110 13.2.2: If-Unmodified-Since is ignored when If-Match is present.
    const stored = object.httpEtag.replace(/^W\//, "");
    return ifMatch.trim() !== "*" && !etagList(ifMatch).includes(stored);
  }

  const unmodifiedSince = Date.parse(request.headers.get("if-unmodified-since") ?? "");
  return !Number.isNaN(unmodifiedSince) && object.uploaded.getTime() > unmodifiedSince;
}

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

  // If-Range: only honor Range when the validator still matches, else send the whole object.
  let honorRange = request.headers.has("range");
  const ifRange = request.headers.get("if-range");
  if (honorRange && ifRange) {
    const head = await bucket.head(key);
    if (!head) return new NextResponse("Not found", { status: 404 });
    honorRange = ifRange === head.httpEtag;
  }

  const object = await bucket.get(key, {
    onlyIf: request.headers,
    ...(honorRange ? { range: request.headers } : {}),
  });
  if (!object) return new NextResponse("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");

  // A failed `onlyIf` returns metadata without a body.
  if (!("body" in object)) {
    return new NextResponse(null, {
      status: failsWritePrecondition(request, object) ? 412 : 304,
      headers,
    });
  }

  // 206 only when R2 actually returned a slice.
  const range = object.range;
  if (range) {
    const start = "suffix" in range ? Math.max(object.size - range.suffix, 0) : (range.offset ?? 0);
    const length = "suffix" in range ? object.size - start : (range.length ?? object.size - start);
    headers.set("Content-Range", `bytes ${start}-${start + length - 1}/${object.size}`);
    headers.set("Content-Length", String(length));
    return new NextResponse(object.body, { status: 206, headers });
  }

  return new NextResponse(object.body, { status: 200, headers });
}
