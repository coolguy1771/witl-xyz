/**
 * Security utilities for input validation and sanitization
 */

// Domain validation
const DOMAIN_REGEX =
  /^(?!-)(?!.*--)[A-Za-z0-9-]+(?<!-)(\.[A-Za-z0-9](?![^.]*--)(?!-)[A-Za-z0-9-]*)+$/;

// List of blocked domains (add any sensitive domains you don't want to check)
const BLOCKED_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "internal",
  ".local",
  ".internal",
  ".corp",
];

/**
 * Validates a domain name against various security checks
 * @param domain The domain to validate
 * @returns true if domain is valid, false otherwise
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== "string") {
    return false;
  }

  // Remove any protocol and path components
  const cleanDomain = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, ""); // Remove port if present

  // Check against basic domain format
  if (!DOMAIN_REGEX.test(cleanDomain)) {
    return false;
  }

  // Block localhost, private IPs, etc.
  for (const blocked of BLOCKED_DOMAINS) {
    if (cleanDomain === blocked || cleanDomain.includes(blocked)) {
      return false;
    }
  }

  // Prevent IP addresses
  if (/^\d+\.\d+\.\d+\.\d+$/.test(cleanDomain)) {
    return false;
  }

  // Check domain TLD is valid (at least 2 chars, not all numeric)
  const tld = cleanDomain.split(".").pop() || "";
  if (tld.length < 2 || /^\d+$/.test(tld)) {
    return false;
  }

  return true;
}

/**
 * Removes potentially dangerous characters from a file name
 * @param filename The filename to sanitize
 * @returns The sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^\w\s.-]/g, "") // Remove unsafe characters
    .replace(/\s+/g, "_"); // Replace spaces with underscores
}

/**
 * Sanitizes a string to prevent XSS and injection attacks
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

/**
 * Validates and normalizes a domain string for SSL certificate checking
 * @param domain The domain to validate and normalize
 * @returns The normalized domain or null if invalid
 */
export function validateAndNormalizeDomain(domain: string): string | null {
  if (!domain || typeof domain !== "string") {
    return null;
  }

  // Normalize: trim, lowercase, and remove protocol/path
  let normalizedDomain = domain.trim().toLowerCase();

  // Remove protocol if present
  normalizedDomain = normalizedDomain.replace(/^https?:\/\//, "");

  // Remove path and query components
  normalizedDomain = normalizedDomain.split("/")[0];
  normalizedDomain = normalizedDomain.split("?")[0];
  normalizedDomain = normalizedDomain.split("#")[0];

  // Remove port if present
  normalizedDomain = normalizedDomain.split(":")[0];

  // Validate the domain
  if (!isValidDomain(normalizedDomain)) {
    return null;
  }

  return normalizedDomain;
}
