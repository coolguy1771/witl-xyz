import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SecurityHeadersAnalyzer } from "@/app/lib/security-headers";
import { handleApiError, ValidationError } from "@/app/lib/error-handler";

const securityAnalysisSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Invalid domain format"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = securityAnalysisSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        `Invalid request: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    const { domain } = validation.data;

    // Normalize domain
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .split(":")[0];

    const analysis =
      await SecurityHeadersAnalyzer.analyzeSecurityHeaders(normalizedDomain);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      throw new ValidationError("Domain parameter is required");
    }

    // Validate domain
    const validation = securityAnalysisSchema.safeParse({ domain });
    if (!validation.success) {
      throw new ValidationError(
        `Invalid domain: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    // Normalize domain
    const normalizedDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .split(":")[0];

    const analysis =
      await SecurityHeadersAnalyzer.analyzeSecurityHeaders(normalizedDomain);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
