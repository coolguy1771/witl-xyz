import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCfProperties } from "@/app/lib/cloudflare";
import { trackEvent } from "@/app/lib/analytics";
import { getWeather } from "@/app/lib/weather";
import { secureLogger, sanitizeHeaders } from "@/app/api/utils/secure-logger";

// Reduced list of Cloudflare headers that we use (more privacy-focused)
// https://developers.cloudflare.com/fundamentals/get-started/reference/http-request-headers/

// Mark route as dynamic to support headers() usage
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();

    // Log safe request info
    secureLogger.info("Visitor data request", {
      headers: sanitizeHeaders(request.headers),
    });

    // request.cf is always populated on Workers; the cf-* headers below only
    // exist if the "Add visitor location headers" managed transform is on.
    const cf = getCfProperties();

    // Approximate location only - no precise coordinates are returned.
    const visitorData = {
      country: cf?.country ?? headersList.get("cf-ipcountry") ?? null,
      countryName: headersList.get("cf-ipcountry-name") || null,
      region: cf?.region ?? headersList.get("cf-region") ?? null,
      city: cf?.city ?? headersList.get("cf-ipcity") ?? null,
      timezone: cf?.timezone ?? headersList.get("cf-timezone") ?? null,
      colo: cf?.colo ?? null,
      connectionType: headersList.get("cf-ipconntype") || null,
      deviceType: headersList.get("cf-device-type") || null,
      requestScheme: headersList.get("cf-visitor")
        ? JSON.parse(headersList.get("cf-visitor") || "{}").scheme
        : null,
    };

    // Add caching and rate limiting headers
    const responseHeaders = {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=60", // Cache for 1 minute
      "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    };

    // Coordinates are used transiently (rounded) to look up weather, never returned.
    // Number(null) is 0, so check for missing values before converting.
    const rawLat = cf?.latitude;
    const rawLon = cf?.longitude;
    const latitude = rawLat == null ? NaN : Number(rawLat);
    const longitude = rawLon == null ? NaN : Number(rawLon);
    const weather =
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? await getWeather(latitude, longitude)
        : null;

    trackEvent("visitor_lookup", "/api/visitor");

    // Return the privacy-focused response
    return NextResponse.json(
      {
        geo: visitorData,
        weather,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    secureLogger.error("Error extracting visitor data", error);

    return NextResponse.json(
      { error: "Failed to retrieve visitor data" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
