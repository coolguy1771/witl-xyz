import * as tls from "tls";

/**
 * Fetch SSL certificate information from a domain
 * @param domain The domain to fetch the certificate from
 * @param timeout Timeout in milliseconds
 * @returns Certificate information
 */
export async function get(
  domain: string,
  timeout: number = 10000
): Promise<{
  subject: unknown;
  issuer: unknown;
  valid_from: string;
  valid_to: string;
  fingerprint256?: string;
  serialNumber?: string;
  version?: number;
  subjectaltname?: string;
}> {
  return new Promise((resolve, reject) => {
    const options = {
      host: domain,
      port: 443,
      servername: domain, // SNI
      rejectUnauthorized: false, // We want to inspect the cert even if invalid
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate(true);

      if (!cert || Object.keys(cert).length === 0) {
        socket.destroy();
        return reject(new Error("No certificate retrieved"));
      }

      // Convert the certificate data to match expected format
      const certInfo = {
        subject: cert.subject,
        issuer: cert.issuer,
        valid_from: cert.valid_from,
        valid_to: cert.valid_to,
        fingerprint256: cert.fingerprint256,
        serialNumber: cert.serialNumber,
        version: undefined, // Node.js TLS doesn't provide version
        subjectaltname: cert.subjectaltname,
      };

      socket.destroy();
      resolve(certInfo);
    });

    socket.on("error", (error) => {
      reject(error);
    });

    // Implement timeout
    socket.setTimeout(timeout);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Certificate fetch timeout"));
    });
  });
}
