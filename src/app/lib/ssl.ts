import {
  SSLCertificate,
  CertificateValidation,
  SANExtension,
  SubjectAlternativeName,
  KeyUsageExtension,
  ExtendedKeyUsageExtension,
  TypeAndValue,
} from "@/app/types/ssl";
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { Crypto } from "@peculiar/webcrypto";

// Initialize crypto engine for PKIjs
const crypto = new Crypto();
pkijs.setEngine(
  "newEngine",
  crypto,
  new pkijs.CryptoEngine({ name: "", crypto, subtle: crypto.subtle })
);

async function validateCertificate(
  certificate: pkijs.Certificate
): Promise<CertificateValidation> {
  const validation: CertificateValidation = {
    isValid: true,
    issues: [],
    warnings: [],
    recommendations: [],
    securityScore: 100,
  };

  try {
    // Check validity period
    const now = new Date();
    const validFrom = certificate.notBefore.value;
    const validTo = certificate.notAfter.value;

    if (now < validFrom) {
      validation.isValid = false;
      validation.issues.push("Certificate is not yet valid");
      validation.securityScore -= 20;
    }

    if (now > validTo) {
      validation.isValid = false;
      validation.issues.push("Certificate has expired");
      validation.securityScore -= 20;
    }

    // Check if certificate expires soon (within 30 days)
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    if (validTo < thirtyDaysFromNow) {
      validation.warnings.push("Certificate expires within 30 days");
      validation.securityScore -= 10;
    }

    // Additional validation checks can be added here
  } catch (error) {
    validation.isValid = false;
    validation.issues.push("Error validating certificate");
    validation.securityScore = 0;
  }

  return validation;
}

async function getCertificateFingerprint(
  certificate: pkijs.Certificate
): Promise<string> {
  try {
    const certBuffer = await certificate.toSchema().toBER();
    const hashBuffer = await crypto.subtle.digest("SHA-256", certBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join(":");
  } catch (error) {
    console.error("Error generating certificate fingerprint:", error);
    return "Error generating fingerprint";
  }
}

export async function getCertificateInfo(
  domain: string
): Promise<SSLCertificate | null> {
  try {
    // Fetch the certificate using a secure connection
    const response = await fetch(`https://${domain}`, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SSL-Check/1.0)",
      },
    });

    // Get the certificate from the response
    const certData = response.headers.get("cf-ssl-certificate");
    if (!certData) {
      console.error("No certificate data found in response headers");
      return null;
    }

    try {
      // Parse the certificate using PKIjs
      const certBuffer = Buffer.from(certData, "base64");
      const certArrayBuffer = certBuffer.buffer.slice(
        certBuffer.byteOffset,
        certBuffer.byteOffset + certBuffer.byteLength
      );

      const asn1 = await asn1js.fromBER(certArrayBuffer);
      if (!asn1.result) {
        console.error("Failed to parse certificate ASN.1 data");
        return null;
      }

      const certificate = await pkijs.Certificate.fromBER(asn1.result.toBER());
      if (!certificate) {
        console.error("Failed to create certificate object from BER data");
        return null;
      }

      // Calculate days remaining
      const validTo = certificate.notAfter.value;
      const now = new Date();
      const daysRemaining = Math.floor(
        (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Extract subject alternative names
      const sans: string[] = [];
      if (certificate.extensions) {
        const sanExt = certificate.extensions.find(
          ext => ext.extnID === "2.5.29.17"
        );
        if (sanExt) {
          const sanValue = sanExt.parsedValue as SubjectAlternativeName;
          if (sanValue && sanValue.names) {
            sanValue.names.forEach((name: SANExtension) => {
              if (name.type === 2) {
                // DNS name
                sans.push(`DNS:${name.value}`);
              }
            });
          }
        }
      }

      // Extract key usage
      const keyUsage: string[] = [];
      if (certificate.extensions) {
        const keyUsageExt = certificate.extensions.find(
          ext => ext.extnID === "2.5.29.14"
        );
        if (keyUsageExt) {
          const keyUsageValue = keyUsageExt.parsedValue as KeyUsageExtension;
          if (keyUsageValue) {
            if (keyUsageValue.digitalSignature)
              keyUsage.push("Digital Signature");
            if (keyUsageValue.nonRepudiation) keyUsage.push("Non-Repudiation");
            if (keyUsageValue.keyEncipherment)
              keyUsage.push("Key Encipherment");
            if (keyUsageValue.dataEncipherment)
              keyUsage.push("Data Encipherment");
            if (keyUsageValue.keyAgreement) keyUsage.push("Key Agreement");
            if (keyUsageValue.keyCertSign) keyUsage.push("Certificate Signing");
            if (keyUsageValue.cRLSign) keyUsage.push("CRL Signing");
            if (keyUsageValue.encipherOnly) keyUsage.push("Encipher Only");
            if (keyUsageValue.decipherOnly) keyUsage.push("Decipher Only");
          }
        }
      }

      // Extract extended key usage
      const extendedKeyUsage: string[] = [];
      if (certificate.extensions) {
        const extKeyUsageExt = certificate.extensions.find(
          ext => ext.extnID === "2.5.29.37"
        );
        if (extKeyUsageExt) {
          const extKeyUsageValue =
            extKeyUsageExt.parsedValue as ExtendedKeyUsageExtension;
          if (extKeyUsageValue && extKeyUsageValue.keyPurposes) {
            extKeyUsageValue.keyPurposes.forEach((purpose: string) => {
              switch (purpose) {
                case "1.3.6.1.5.5.7.3.1":
                  extendedKeyUsage.push("Server Authentication");
                  break;
                case "1.3.6.1.5.5.7.3.2":
                  extendedKeyUsage.push("Client Authentication");
                  break;
                case "1.3.6.1.5.5.7.3.3":
                  extendedKeyUsage.push("Code Signing");
                  break;
                case "1.3.6.1.5.5.7.3.4":
                  extendedKeyUsage.push("Email Protection");
                  break;
                case "1.3.6.1.5.5.7.3.8":
                  extendedKeyUsage.push("Time Stamping");
                  break;
                case "1.3.6.1.5.5.7.3.9":
                  extendedKeyUsage.push("OCSP Signing");
                  break;
              }
            });
          }
        }
      }

      // Validate the certificate
      const validation = await validateCertificate(certificate);

      // Create the certificate object
      const certInfo: SSLCertificate = {
        subject: {
          CN:
            certificate.subject.typesAndValues.find(
              (tv: TypeAndValue) => tv.type === "2.5.4.3"
            )?.value.valueBlock.value || domain,
          O:
            certificate.subject.typesAndValues.find(
              (tv: TypeAndValue) => tv.type === "2.5.4.10"
            )?.value.valueBlock.value || "Unknown Organization",
        },
        issuer: {
          CN:
            certificate.issuer.typesAndValues.find(
              (tv: TypeAndValue) => tv.type === "2.5.4.3"
            )?.value.valueBlock.value || "Unknown Issuer",
          O:
            certificate.issuer.typesAndValues.find(
              (tv: TypeAndValue) => tv.type === "2.5.4.10"
            )?.value.valueBlock.value || "Unknown CA",
        },
        validFrom: certificate.notBefore.value.toISOString(),
        validTo: certificate.notAfter.value.toISOString(),
        daysRemaining,
        serialNumber: certificate.serialNumber.valueBlock.valueHex.toString(),
        signatureAlgorithm: certificate.signatureAlgorithm.algorithmId,
        fingerprint: await getCertificateFingerprint(certificate),
        subjectAlternativeName: sans,
        keyUsage,
        extendedKeyUsage,
        version: certificate.version,
        validation: {
          isValid: validation.isValid,
          issues: validation.issues,
          warnings: validation.warnings,
          recommendations: validation.recommendations,
          securityScore: validation.securityScore,
        },
      };

      return certInfo;
    } catch (parseError) {
      console.error("Error parsing certificate data:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return null;
  }
}

export async function get(
  domain: string,
  timeout?: number
): Promise<SSLCertificate | null> {
  return getCertificateInfo(domain);
}
