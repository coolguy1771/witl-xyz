import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
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

    // Get approximate location data only - not precise coordinates
    // More privacy-focused visitor information
    const visitorData = {
      // Only use country and rough city data, no precise geolocation
      country: headersList.get("cf-ipcountry") || null,
      countryName: headersList.get("cf-ipcountry-name") || null,
      region: headersList.get("cf-region") || null,
      city: headersList.get("cf-ipcity") || null,
      timezone: headersList.get("cf-timezone") || null,

      // Anonymize connection data
      connectionType: headersList.get("cf-ipconntype") || null,

      // Basic device categories but no fingerprinting
      deviceType: headersList.get("cf-device-type") || null,

      // Request information - safe data only
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

    // Generate appropriate weather for the location
    let weather = null;

    if (visitorData.city && visitorData.country) {
      // Weather data can be more realistic when based on location
      // but don't store precise geolocation data
      const mockWeatherData = {
        temp: Math.floor(Math.random() * 25) + 5, // 5-30°C
        condition: ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Snowy"][
          Math.floor(Math.random() * 5)
        ],
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
      };

      weather = mockWeatherData;
    }

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
