import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

function validatedIp(raw: string | null | undefined): string | null {
  const candidate = raw?.trim();
  if (!candidate || isIP(candidate) === 0) {
    return null;
  }

  return candidate;
}

function getClientIp(headersList: Headers): string {
  const cfIp = validatedIp(headersList.get("cf-connecting-ip"));
  if (cfIp) {
    return cfIp;
  }

  const forwarded = validatedIp(headersList.get("x-forwarded-for")?.split(",")[0]);
  if (forwarded) {
    return forwarded;
  }

  return "unknown";
}

export async function GET() {
  const headersList = await headers();
  return NextResponse.json({ ip: getClientIp(headersList) });
}
