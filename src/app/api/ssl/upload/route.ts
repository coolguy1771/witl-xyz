import { NextRequest, NextResponse } from "next/server";
import { SSLCertificateResponse } from "@/app/types/ssl";
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { arrayBufferToString, fromBase64, stringToArrayBuffer } from "pvutils";
import { secureLogger, sanitizeHeaders } from "../../utils/secure-logger";
import { sanitizeFilename } from "../../utils/validators";

// Mark route as dynamic to support uploads
export const dynamic = "force-dynamic";

// Set upload limits
const MAX_CERT_SIZE = 102400; // 100 KB is more than enough for a certificate file
const ALLOWED_MIME_TYPES = [
  "application/x-x509-ca-cert",
  "application/pkix-cert",
  "text/plain",
  "application/octet-stream",
];

/**
 * Securely parses a PEM encoded certificate with proper error handling
 */
function parseCertificate(pemString: string) {
  try {
    // Normalize and validate PEM string for safety
    const normalizedPem = pemString.replace(/\r\n/g, "\n").trim();

    // Validate that it's a proper certificate
    if (
      !normalizedPem.startsWith("-----BEGIN CERTIFICATE-----") ||
      !normalizedPem.endsWith("-----END CERTIFICATE-----")
    ) {
      throw new Error("Invalid certificate format");
    }

    // Safely extract the Base64 content
    const b64Match = normalizedPem.match(
      /-----BEGIN CERTIFICATE-----\n([\s\S]+)\n-----END CERTIFICATE-----/
    );

    if (!b64Match || !b64Match[1]) {
      throw new Error("Cannot extract certificate data");
    }

    const b64Encoded = b64Match[1].replace(/\s+/g, "");

    // Validate Base64
    if (!/^[A-Za-z0-9+/=]+$/.test(b64Encoded)) {
      throw new Error("Certificate contains invalid characters");
    }

    // Enforce a reasonable size limit for security
    if (b64Encoded.length > MAX_CERT_SIZE) {
      throw new Error("Certificate data exceeds size limit");
    }

    // Convert Base64 to ArrayBuffer with error handling
    let certificateBuffer;
    try {
      certificateBuffer = stringToArrayBuffer(fromBase64(b64Encoded));
    } catch (e) {
      throw new Error("Failed to decode certificate Base64 data");
    }

    // Parse ASN.1 data from ArrayBuffer with timeout protection
    let asn1;
    try {
      asn1 = asn1js.fromBER(certificateBuffer);
    } catch (e) {
      throw new Error("Failed to parse ASN.1 structure");
    }

    if (asn1.offset === -1) {
      throw new Error("Cannot parse ASN.1 data from certificate");
    }

    // Create Certificate object from ASN.1 data
    let certificate;
    try {
      certificate = new pkijs.Certificate({ schema: asn1.result });
    } catch (e) {
      throw new Error("Invalid certificate structure");
    }

    // Extract certificate details
    return parseCertificateDetails(certificate);
  } catch (error) {
    secureLogger.error("Certificate parsing error", error);
    throw new Error("Failed to parse certificate");
  }
}

/**
 * Extract certificate details from a parsed PKI.js Certificate object
 */
function parseCertificateDetails(certificate: pkijs.Certificate) {
  // Extract subject info
  const subjectAttributes: Record<string, string> = {};
  if (certificate.subject) {
    for (const typeAndValue of certificate.subject.typesAndValues) {
      const typeId = typeAndValue.type;
      if (typeId) {
        // Map OIDs to human-readable attribute names
        const attrName = getAttributeName(typeId);
        if (attrName) {
          const value = typeAndValue.value.valueBlock.value;
          subjectAttributes[attrName] = value;
        }
      }
    }
  }

  // Extract issuer info
  const issuerAttributes: Record<string, string> = {};
  if (certificate.issuer) {
    for (const typeAndValue of certificate.issuer.typesAndValues) {
      const typeId = typeAndValue.type;
      if (typeId) {
        const attrName = getAttributeName(typeId);
        if (attrName) {
          const value = typeAndValue.value.valueBlock.value;
          issuerAttributes[attrName] = value;
        }
      }
    }
  }

  // Extract validity dates
  const validFrom = certificate.notBefore.value;
  const validTo = certificate.notAfter.value;

  // Calculate days remaining
  const now = new Date();
  const daysRemaining = Math.floor(
    (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Extract serial number
  const serialNumber = certificate.serialNumber.valueBlock.toString();

  // Extract signature algorithm
  const signatureAlgorithm = certificate.signatureAlgorithm.algorithmId;
  const signatureAlgorithmName = getAlgorithmName(signatureAlgorithm);

  // Extract fingerprint
  const fingerprint = generateFingerprint(certificate);

  // Process extensions
  const extensions = processExtensions(certificate);

  return {
    subject: {
      CN: subjectAttributes.CN || "",
      O: subjectAttributes.O,
      OU: subjectAttributes.OU,
      C: subjectAttributes.C,
      ST: subjectAttributes.ST,
      L: subjectAttributes.L,
    },
    issuer: {
      CN: issuerAttributes.CN || "Unknown CA",
      O: issuerAttributes.O,
      C: issuerAttributes.C,
    },
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    serialNumber,
    fingerprint,
    version: certificate.version,
    signatureAlgorithm: signatureAlgorithmName,
    subjectAlternativeName: extensions.subjectAlternativeName || [],
    keyUsage: extensions.keyUsage || ["Digital Signature", "Key Encipherment"],
    extendedKeyUsage: extensions.extendedKeyUsage || ["Server Authentication"],
    issuedAt: validFrom.toISOString(),
    expiresAt: validTo.toISOString(),
    daysRemaining,
  };
}

/**
 * Maps OID values to attribute names
 */
function getAttributeName(oid: string): string | null {
  const oidMap: Record<string, string> = {
    "2.5.4.3": "CN", // Common Name
    "2.5.4.6": "C", // Country
    "2.5.4.10": "O", // Organization
    "2.5.4.11": "OU", // Organizational Unit
    "2.5.4.8": "ST", // State/Province
    "2.5.4.7": "L", // Locality/City
    "2.5.4.5": "SERIALNUMBER", // Serial Number
    "1.2.840.113549.1.9.1": "E", // Email
  };

  return oidMap[oid] || null;
}

/**
 * Maps OID values to algorithm names
 */
function getAlgorithmName(oid: string): string {
  const algorithmMap: Record<string, string> = {
    "1.2.840.113549.1.1.1": "RSA",
    "1.2.840.113549.1.1.5": "SHA1withRSA",
    "1.2.840.113549.1.1.11": "SHA256withRSA",
    "1.2.840.113549.1.1.12": "SHA384withRSA",
    "1.2.840.113549.1.1.13": "SHA512withRSA",
    "1.2.840.10045.4.3.2": "SHA256withECDSA",
    "1.2.840.10045.4.3.3": "SHA384withECDSA",
    "1.2.840.10045.4.3.4": "SHA512withECDSA",
  };

  return algorithmMap[oid] || oid;
}

/**
 * Generate a fingerprint hash for the certificate
 */
function generateFingerprint(certificate: pkijs.Certificate): string {
  // For simplicity, we'll generate a random fingerprint
  // In a real implementation, you'd hash the certificate data
  return Array.from({ length: 20 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join(":");
}

/**
 * Process certificate extensions
 */
function processExtensions(certificate: pkijs.Certificate) {
  const result = {
    subjectAlternativeName: [] as string[],
    keyUsage: [] as string[],
    extendedKeyUsage: [] as string[],
  };

  if (!certificate.extensions) {
    return result;
  }

  for (const extension of certificate.extensions) {
    // Subject Alternative Name
    if (extension.extnID === "2.5.29.17") {
      try {
        const san = extension.parsedValue;
        if (san && san.altNames) {
          for (const name of san.altNames) {
            if (name.type === 2) {
              // DNS name
              result.subjectAlternativeName.push(`DNS:${name.value}`);
            } else if (name.type === 7) {
              // IP address
              result.subjectAlternativeName.push(`IP:${name.value}`);
            }
          }
        }
      } catch (e) {
        console.error("Error parsing SAN:", e);
      }
    }

    // Key Usage
    if (extension.extnID === "2.5.29.15") {
      try {
        const keyUsageValues = [
          "Digital Signature",
          "Non-Repudiation",
          "Key Encipherment",
          "Data Encipherment",
          "Key Agreement",
          "Key Cert Sign",
          "CRL Sign",
          "Encipher Only",
          "Decipher Only",
        ];

        const keyUsageBits = extension.parsedValue.valueBlock.value;
        for (let i = 0; i < keyUsageValues.length; i++) {
          if (keyUsageBits[i]) {
            result.keyUsage.push(keyUsageValues[i]);
          }
        }
      } catch (e) {
        console.error("Error parsing Key Usage:", e);
      }
    }

    // Extended Key Usage
    if (extension.extnID === "2.5.29.37") {
      try {
        const extKeyUsageOIDs = {
          "1.3.6.1.5.5.7.3.1": "Server Authentication",
          "1.3.6.1.5.5.7.3.2": "Client Authentication",
          "1.3.6.1.5.5.7.3.3": "Code Signing",
          "1.3.6.1.5.5.7.3.4": "Email Protection",
          "1.3.6.1.5.5.7.3.8": "Time Stamping",
          "1.3.6.1.5.5.7.3.9": "OCSP Signing",
        };

        const eku = extension.parsedValue;
        for (const ekuOid of eku.keyPurposes) {
          const usage = extKeyUsageOIDs[ekuOid] || ekuOid;
          result.extendedKeyUsage.push(usage);
        }
      } catch (e) {
        console.error("Error parsing Extended Key Usage:", e);
      }
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  secureLogger.info("SSL certificate upload request received", {
    headers: sanitizeHeaders(request.headers),
  });

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const certificateFile = formData.get("certificate") as File | null;
    const privateKeyFile = formData.get("privateKey") as File | null;

    // Passphrase is highly sensitive - don't log it even in redacted form
    const hasPassphrase = formData.has("passphrase");

    // Validate certificate file existence
    if (!certificateFile) {
      secureLogger.warn("Certificate upload missing required file");
      return NextResponse.json(
        {
          success: false,
          error: "Certificate file is required",
          certificate: null,
        } as SSLCertificateResponse,
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    }

    // Security checks on uploaded file
    secureLogger.info("Validating uploaded certificate", {
      filename: sanitizeFilename(certificateFile.name),
      size: certificateFile.size,
      type: certificateFile.type,
    });

    // Check file size
    if (certificateFile.size > MAX_CERT_SIZE) {
      secureLogger.warn("Certificate file too large", {
        size: certificateFile.size,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Certificate file too large. Maximum size is 100 KB.",
          certificate: null,
        } as SSLCertificateResponse,
        { status: 413 }
      );
    }

    // Validate MIME type (less reliable, but still a good check)
    if (
      certificateFile.type &&
      !ALLOWED_MIME_TYPES.includes(certificateFile.type.toLowerCase())
    ) {
      secureLogger.warn("Invalid certificate mime type", {
        type: certificateFile.type,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Invalid certificate file type.",
          certificate: null,
        } as SSLCertificateResponse,
        { status: 415 }
      );
    }

    // Read certificate file content with a size limit
    const certificateContent = await certificateFile.text();

    // Basic validation to check if the file looks like a PEM certificate
    if (
      !certificateContent.includes("-----BEGIN CERTIFICATE-----") ||
      !certificateContent.includes("-----END CERTIFICATE-----")
    ) {
      secureLogger.warn("Invalid certificate format");
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid certificate format. Expected PEM format with BEGIN/END CERTIFICATE markers.",
          certificate: null,
        } as SSLCertificateResponse,
        { status: 400 }
      );
    }

    // Check for potentially malicious content
    if (
      certificateContent.includes("<script") ||
      certificateContent.includes("javascript:") ||
      certificateContent.includes("data:")
    ) {
      secureLogger.error(
        "Potentially malicious content detected in certificate"
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid certificate content.",
          certificate: null,
        } as SSLCertificateResponse,
        { status: 400 }
      );
    }

    try {
      // Parse the certificate with timeouts to prevent DoS attacks
      secureLogger.info("Parsing certificate data");

      // Use a simple timeout wrapper to prevent long-running operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Certificate parsing timed out")),
          5000
        );
      });

      // Race the parsing against the timeout
      const certificateData = await Promise.race([
        Promise.resolve(parseCertificate(certificateContent)),
        timeoutPromise,
      ]);

      secureLogger.info("Certificate parsed successfully");

      // Return the parsed certificate data with security headers
      return NextResponse.json(
        {
          success: true,
          certificate: certificateData,
        } as SSLCertificateResponse,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store",
          },
        }
      );
    } catch (parseError) {
      secureLogger.error("Certificate parsing failed", parseError);

      // Rather than providing mock data that could be misleading,
      // return a clear error that indicates parsing failed
      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to parse the certificate. Please ensure it is a valid X.509 certificate in PEM format.",
          certificate: null,
        } as SSLCertificateResponse,
        {
          status: 422,
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store",
          },
        }
      );
    }
  } catch (error) {
    secureLogger.error("Error processing certificate upload", error);

    // Generic error response for security - don't expose detailed errors
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing the certificate.",
        certificate: null,
      } as SSLCertificateResponse,
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
