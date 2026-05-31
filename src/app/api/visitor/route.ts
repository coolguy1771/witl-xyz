import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { secureLogger, sanitizeHeaders } from "@/app/api/utils/secure-logger";
import { fetchWeather } from "@/app/lib/open-meteo";

export const dynamic = "force-dynamic";

function parseCoordinate(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();

    secureLogger.info("Visitor data request", {
      headers: sanitizeHeaders(request.headers),
    });

    const latitude = parseCoordinate(headersList.get("cf-iplatitude"));
    const longitude = parseCoordinate(headersList.get("cf-iplongitude"));

    const visitorData = {
      country: headersList.get("cf-ipcountry") || null,
      countryName: headersList.get("cf-ipcountry-name") || null,
      region: headersList.get("cf-region") || null,
      city: headersList.get("cf-ipcity") || null,
      timezone: headersList.get("cf-timezone") || null,
      connectionType: headersList.get("cf-ipconntype") || null,
      deviceType: headersList.get("cf-device-type") || null,
      requestScheme: headersList.get("cf-visitor")
        ? JSON.parse(headersList.get("cf-visitor") || "{}").scheme
        : null,
    };

    let weather = null;
    if (latitude !== null && longitude !== null) {
      weather = await fetchWeather(latitude, longitude);
    }

    const responseHeaders = {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300",
      "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    };

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
