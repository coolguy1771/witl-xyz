/**
 * Secure logging that prevents sensitive data leakage
 */

// List of sensitive fields that should be redacted from logs
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "key",
  "secret",
  "auth",
  "cookie",
  "session",
  "jwt",
  "bearer",
  "credit",
  "card",
  "cvv",
  "ssn",
  "social",
  "private",
  "fingerprint",
  "passport",
];

/**
 * Redacts sensitive information from objects for safe logging
 * @param data The data to sanitize for logging
 * @returns Sanitized data object
 */
function redactSensitiveData(data: unknown): unknown {
  if (!data) {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  // Create a copy to avoid modifying the original
  const sanitized = { ...data };

  const obj = sanitized as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();

    // Redact values for sensitive keys
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
      obj[key] = "[REDACTED]";
    }
    // Recursively sanitize nested objects
    else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = redactSensitiveData(obj[key]);
    }
  }

  return obj;
}

/**
 * Securely log information with sensitive data redacted
 */
export const secureLogger = {
  info(message: string, data?: unknown): void {
    console.log(message, data ? redactSensitiveData(data) : "");
  },

  warn(message: string, data?: unknown): void {
    console.warn(message, data ? redactSensitiveData(data) : "");
  },

  error(message: string, error?: unknown, data?: unknown): void {
    const errorMsg = error instanceof Error ? { name: error.name, message: error.message } : error;

    console.error(
      message,
      errorMsg ? redactSensitiveData(errorMsg) : "",
      data ? redactSensitiveData(data) : ""
    );
  },
};

/**
 * Strip sensitive headers from logs
 * @param headers Headers to sanitize for logging
 * @returns Safe headers object for logging
 */
export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const safeHeaders: Record<string, string> = {};

  // List of headers that are safe to log
  const safeHeaderNames = [
    "content-type",
    "content-length",
    "user-agent",
    "accept",
    "accept-language",
    "connection",
    "host",
    "referer",
  ];

  for (const name of safeHeaderNames) {
    const value = headers.get(name);
    if (value) {
      safeHeaders[name] = value;
    }
  }

  return safeHeaders;
}
