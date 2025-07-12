import { NextRequest } from "next/server";
import { getSSLInfo } from "@/app/lib/ssl-simple";
import { domainSchema } from "@/app/lib/validation";
import { handleApiError, ValidationError } from "@/app/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = domainSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError(
        `Invalid domain format: ${validation.error.issues.map(i => i.message).join(", ")}`
      );
    }

    const { domain } = validation.data;
    const certificate = await getSSLInfo(domain);

    return Response.json({
      domain: certificate.domain,
      valid: certificate.valid,
      issuer: certificate.issuer,
      expires: certificate.expires,
      daysUntilExpiry: certificate.daysUntilExpiry,
      commonName: certificate.commonName,
      organization: certificate.organization,
      validFrom: certificate.validFrom,
      validTo: certificate.validTo,
      fingerprint: certificate.fingerprint,
      serialNumber: certificate.serialNumber,
      signatureAlgorithm: certificate.signatureAlgorithm,
      subjectAlternativeNames: certificate.subjectAlternativeNames || [],
      error: certificate.error,
    });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
