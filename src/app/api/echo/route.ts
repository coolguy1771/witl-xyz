import { NextRequest, NextResponse } from "next/server";
import yaml from "js-yaml";
import { gzip, deflate } from "zlib";
import { promisify } from "util";
// import { echoSchema } from "@/app/lib/validation";

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: "Too many requests",
  statusCode: 429,
};

// Request size limits
const SIZE_LIMITS = {
  maxBodySize: 1024 * 1024, // 1MB
  maxHeaderSize: 16 * 1024, // 16KB
  maxQuerySize: 2048, // 2KB
  maxUrlLength: 2048, // 2KB
};

// Logging configuration
interface LogConfig {
  level: "debug" | "info" | "warn" | "error";
  format: "json" | "text";
  includeHeaders: boolean;
  includeBody: boolean;
  includeQuery: boolean;
}

const DEFAULT_LOG_CONFIG: LogConfig = {
  level: "info",
  format: "text",
  includeHeaders: true,
  includeBody: false,
  includeQuery: true,
};

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface EchoResponse {
  timestamp?: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  ip?: string;
  path?: string;
  protocol?: string;
  hostname?: string;
  subdomains?: string[];
  fresh?: boolean;
  xhr?: boolean;
  os?: {
    hostname?: string;
  };
  connection?: Record<string, unknown>;
  cloudflare?: {
    ip?: string;
    city?: string;
    country?: string;
    region?: string;
    regionCode?: string;
    continent?: string;
    latitude?: string;
    longitude?: string;
    timezone?: string;
    postalCode?: string;
    metroCode?: string;
    ray?: string;
    visitor?: {
      scheme?: string;
    };
    warpTagId?: string;
    connectingIp?: string;
    certPresented?: boolean;
    certRevoked?: boolean;
    certVerified?: boolean;
  };
  timing?: {
    requestStart?: number;
    requestEnd?: number;
    processingTime?: number;
  };
  size?: {
    headers?: number;
    body?: number;
    total?: number;
  };
  rateLimit?: {
    remaining?: number;
    reset?: number;
    limit?: number;
  };
}

function extractCloudflareInfo(
  headers: Record<string, string>
): EchoResponse["cloudflare"] {
  return {
    ip: headers["cf-connecting-ip"],
    city: headers["cf-ipcity"],
    country: headers["cf-ipcountry"],
    region: headers["cf-region"],
    regionCode: headers["cf-region-code"],
    continent: headers["cf-ipcontinent"],
    latitude: headers["cf-iplatitude"],
    longitude: headers["cf-iplongitude"],
    timezone: headers["cf-timezone"],
    postalCode: headers["cf-postal-code"],
    metroCode: headers["cf-metro-code"],
    ray: headers["cf-ray"],
    visitor: headers["cf-visitor"]
      ? JSON.parse(headers["cf-visitor"])
      : undefined,
    warpTagId: headers["cf-warp-tag-id"],
    connectingIp: headers["cf-connecting-ip"],
    certPresented: headers["cf-cert-presented"] === "true",
    certRevoked: headers["cf-cert-revoked"] === "true",
    certVerified: headers["cf-cert-verified"] === "true",
  };
}

function formatXML(data: EchoResponse): string {
  const xmlParts = ['<?xml version="1.0" encoding="UTF-8"?>', "<echo>"];

  if (data.timestamp) {
    xmlParts.push(`  <timestamp>${data.timestamp}</timestamp>`);
  }
  if (data.method) {
    xmlParts.push(`  <method>${data.method}</method>`);
  }
  if (data.path) {
    xmlParts.push(`  <path>${data.path}</path>`);
  }
  if (data.protocol) {
    xmlParts.push(`  <protocol>${data.protocol}</protocol>`);
  }
  if (data.hostname) {
    xmlParts.push(`  <hostname>${data.hostname}</hostname>`);
  }
  if (data.subdomains?.length) {
    xmlParts.push("  <subdomains>");
    data.subdomains.forEach(subdomain => {
      xmlParts.push(`    <subdomain>${subdomain}</subdomain>`);
    });
    xmlParts.push("  </subdomains>");
  }
  if (data.headers) {
    xmlParts.push("  <headers>");
    Object.entries(data.headers).forEach(([key, value]) => {
      xmlParts.push(`    <${key}>${value}</${key}>`);
    });
    xmlParts.push("  </headers>");
  }
  if (data.query) {
    xmlParts.push("  <query>");
    Object.entries(data.query).forEach(([key, value]) => {
      xmlParts.push(`    <${key}>${value}</${key}>`);
    });
    xmlParts.push("  </query>");
  }
  if (data.body !== undefined) {
    xmlParts.push(`  <body>${JSON.stringify(data.body)}</body>`);
  }
  if (data.ip) {
    xmlParts.push(`  <ip>${data.ip}</ip>`);
  }
  if (data.cloudflare) {
    xmlParts.push("  <cloudflare>");
    Object.entries(data.cloudflare).forEach(([key, value]) => {
      if (value !== undefined) {
        xmlParts.push(`    <${key}>${JSON.stringify(value)}</${key}>`);
      }
    });
    xmlParts.push("  </cloudflare>");
  }
  if (data.os) {
    xmlParts.push("  <os>");
    Object.entries(data.os).forEach(([key, value]) => {
      if (value !== undefined) {
        xmlParts.push(`    <${key}>${value}</${key}>`);
      }
    });
    xmlParts.push("  </os>");
  }

  xmlParts.push("</echo>");
  return xmlParts.join("\n");
}

function formatYAML(data: EchoResponse): string {
  // Filter out undefined values
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );

  return yaml.dump(cleanData, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });
}

function formatCSV(data: EchoResponse): string {
  const rows = [["Field", "Value"]];

  if (data.timestamp) {
    rows.push(["timestamp", data.timestamp]);
  }
  if (data.method) {
    rows.push(["method", data.method]);
  }
  if (data.path) {
    rows.push(["path", data.path]);
  }
  if (data.protocol) {
    rows.push(["protocol", data.protocol]);
  }
  if (data.hostname) {
    rows.push(["hostname", data.hostname]);
  }
  if (data.subdomains?.length) {
    rows.push(["subdomains", data.subdomains.join(", ")]);
  }
  if (data.ip) {
    rows.push(["ip", data.ip]);
  }

  // Add headers
  if (data.headers) {
    Object.entries(data.headers).forEach(([key, value]) => {
      rows.push([`header.${key}`, value]);
    });
  }

  // Add query parameters
  if (data.query) {
    Object.entries(data.query).forEach(([key, value]) => {
      rows.push([`query.${key}`, value]);
    });
  }

  // Add body if it's a simple object
  if (data.body !== undefined) {
    if (data.body && typeof data.body === "object") {
      Object.entries(data.body).forEach(([key, value]) => {
        rows.push([`body.${key}`, String(value)]);
      });
    } else {
      rows.push(["body", String(data.body)]);
    }
  }

  // Add Cloudflare info
  if (data.cloudflare) {
    Object.entries(data.cloudflare).forEach(([key, value]) => {
      if (value !== undefined) {
        rows.push([`cloudflare.${key}`, String(value)]);
      }
    });
  }

  // Add OS info
  if (data.os) {
    Object.entries(data.os).forEach(([key, value]) => {
      if (value !== undefined) {
        rows.push([`os.${key}`, String(value)]);
      }
    });
  }

  return rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
}

function formatPlainText(data: EchoResponse): string {
  const lines: string[] = [];

  if (data.timestamp) {
    lines.push(`Timestamp: ${data.timestamp}`);
  }
  if (data.method) {
    lines.push(`Method: ${data.method}`);
  }
  if (data.path) {
    lines.push(`Path: ${data.path}`);
  }
  if (data.protocol) {
    lines.push(`Protocol: ${data.protocol}`);
  }
  if (data.hostname) {
    lines.push(`Hostname: ${data.hostname}`);
  }
  if (data.subdomains?.length) {
    lines.push(`Subdomains: ${data.subdomains.join(", ")}`);
  }

  if (data.headers) {
    lines.push("\nHeaders:");
    Object.entries(data.headers).forEach(([key, value]) => {
      lines.push(`  ${key}: ${value}`);
    });
  }

  if (data.query) {
    lines.push("\nQuery Parameters:");
    Object.entries(data.query).forEach(([key, value]) => {
      lines.push(`  ${key}: ${value}`);
    });
  }

  if (data.body !== undefined) {
    lines.push("\nBody:");
    lines.push(JSON.stringify(data.body, null, 2));
  }

  if (data.ip) {
    lines.push(`\nIP Address: ${data.ip}`);
  }

  if (data.cloudflare) {
    lines.push("\nCloudflare Information:");
    Object.entries(data.cloudflare).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  ${key}: ${JSON.stringify(value)}`);
      }
    });
  }

  if (data.os) {
    lines.push("\nOS Information:");
    Object.entries(data.os).forEach(([key, value]) => {
      if (value !== undefined) {
        lines.push(`  ${key}: ${value}`);
      }
    });
  }

  return lines.join("\n");
}

function getResponseData(
  request: NextRequest,
  includeFields: string[]
): EchoResponse {
  const url = new URL(request.url);
  const headers: Record<string, string> = {};
  const query: Record<string, string> = {};
  let body: unknown = null;

  // Only include headers if requested
  if (includeFields.includes("headers")) {
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Only include query parameters if requested
  if (includeFields.includes("query")) {
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
  }

  // Only include body if requested
  if (includeFields.includes("body") && request.body) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = request.json();
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      body = request.formData();
    } else {
      body = request.text();
    }
  }

  // Get client IP
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Extract subdomains from hostname
  const hostname = request.headers.get("host") || "";
  const subdomains = hostname.split(".").slice(0, -2);

  return {
    timestamp: includeFields.includes("timestamp")
      ? new Date().toISOString()
      : undefined,
    method: includeFields.includes("method") ? request.method : undefined,
    headers: includeFields.includes("headers") ? headers : undefined,
    query: includeFields.includes("query") ? query : undefined,
    body: includeFields.includes("body") ? body : undefined,
    ip: includeFields.includes("ip") ? ip : undefined,
    path: includeFields.includes("path") ? url.pathname : undefined,
    protocol: includeFields.includes("protocol")
      ? url.protocol.replace(":", "")
      : undefined,
    hostname: includeFields.includes("hostname") ? hostname : undefined,
    subdomains: includeFields.includes("subdomains") ? subdomains : undefined,
    fresh: includeFields.includes("fresh") ? false : undefined,
    xhr: includeFields.includes("xhr") ? false : undefined,
    os: includeFields.includes("os")
      ? { hostname: process.env.HOSTNAME }
      : undefined,
    connection: includeFields.includes("connection") ? {} : undefined,
    cloudflare: includeFields.includes("cloudflare")
      ? extractCloudflareInfo(headers)
      : undefined,
  };
}

function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(ip) || {
    count: 0,
    resetTime: now + config.windowMs,
  };
  current.count++;
  rateLimitStore.set(ip, current);

  return {
    allowed: current.count <= config.max,
    remaining: Math.max(0, config.max - current.count),
    reset: current.resetTime,
  };
}

function validateRateLimitConfig(
  config: Partial<RateLimitConfig>
): RateLimitConfig {
  return {
    windowMs: Math.max(1000, config.windowMs || DEFAULT_RATE_LIMIT.windowMs),
    max: Math.max(1, config.max || DEFAULT_RATE_LIMIT.max),
    message: config.message || DEFAULT_RATE_LIMIT.message,
    statusCode: config.statusCode || DEFAULT_RATE_LIMIT.statusCode,
  };
}

function validateRequest(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  // Check URL length
  if (request.url.length > SIZE_LIMITS.maxUrlLength) {
    return { valid: false, error: "URL length exceeds limit" };
  }

  // Check header size
  let headerSize = 0;
  request.headers.forEach((value, key) => {
    headerSize += key.length + value.length;
  });

  if (headerSize > SIZE_LIMITS.maxHeaderSize) {
    return { valid: false, error: "Header size exceeds limit" };
  }

  // Check content length if present
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > SIZE_LIMITS.maxBodySize) {
    return { valid: false, error: "Body size exceeds limit" };
  }

  // Check query string size
  const url = new URL(request.url);
  if (url.search.length > SIZE_LIMITS.maxQuerySize) {
    return { valid: false, error: "Query string size exceeds limit" };
  }

  // Validate content type for POST/PUT/PATCH
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const contentType = request.headers.get("content-type");
    if (!contentType) {
      return { valid: false, error: "Content-Type header is required" };
    }
  }

  return { valid: true };
}

async function compressResponse(
  data: string,
  encoding: string
): Promise<Buffer> {
  switch (encoding) {
    case "gzip":
      return gzipAsync(Buffer.from(data));
    case "deflate":
      return deflateAsync(Buffer.from(data));
    default:
      return Buffer.from(data);
  }
}

function groupFields(
  data: EchoResponse,
  groups: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const group of groups) {
    switch (group) {
      case "request":
        result.request = {
          method: data.method,
          path: data.path,
          protocol: data.protocol,
          hostname: data.hostname,
          headers: data.headers,
          query: data.query,
          body: data.body,
        };
        break;
      case "network":
        result.network = {
          ip: data.ip,
          cloudflare: data.cloudflare,
        };
        break;
      case "system":
        result.system = {
          os: data.os,
          connection: data.connection,
        };
        break;
      case "meta":
        result.meta = {
          timestamp: data.timestamp,
          timing: data.timing,
          size: data.size,
          rateLimit: data.rateLimit,
        };
        break;
      default:
        // Add ungrouped fields
        if (!result.other || typeof result.other !== "object") result.other = {};
        (result.other as Record<string, unknown>)[group] = (data as Record<string, unknown>)[group];
    }
  }

  return result;
}

function logRequest(
  request: NextRequest,
  response: NextResponse,
  config: LogConfig
) {
  const logData: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.url,
    statusCode: response.status,
    duration:
      Date.now() - (parseInt(request.headers.get("x-request-start") || "0", 10)) || 0,
  };

  if (config.includeHeaders) {
    logData.headers = Object.fromEntries(request.headers);
  }

  if (config.includeQuery) {
    const url = new URL(request.url);
    logData.query = Object.fromEntries(url.searchParams);
  }

  if (config.includeBody && ["POST", "PUT", "PATCH"].includes(request.method)) {
    // Note: Body can only be read once, so we need to handle this carefully
    logData.hasBody = true;
  }

  const logMessage =
    config.format === "json"
      ? JSON.stringify(logData)
      : `[${logData.timestamp}] ${logData.method} ${logData.path} - ${logData.statusCode} - ${logData.duration}ms`;

  switch (config.level) {
    case "debug":
      console.debug(logMessage);
      break;
    case "info":
      console.info(logMessage);
      break;
    case "warn":
      console.warn(logMessage);
      break;
    case "error":
      console.error(logMessage);
      break;
  }
}

async function handleRequest(request: NextRequest) {
  const startTime = Date.now();

  try {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // Parse rate limit configuration from query parameters
    const rateLimitConfig = validateRateLimitConfig({
      windowMs: parseInt(url.searchParams.get("rateLimit.windowMs") || "0", 10),
      max: parseInt(url.searchParams.get("rateLimit.max") || "0", 10),
      message: url.searchParams.get("rateLimit.message") || undefined,
      statusCode: parseInt(
        url.searchParams.get("rateLimit.statusCode") || "0",
        10
      ),
    });

    // Parse logging configuration from query parameters
    const logConfig: LogConfig = {
      level:
        (url.searchParams.get("log.level") as LogConfig["level"]) ||
        DEFAULT_LOG_CONFIG.level,
      format:
        (url.searchParams.get("log.format") as LogConfig["format"]) ||
        DEFAULT_LOG_CONFIG.format,
      includeHeaders: url.searchParams.get("log.includeHeaders") !== "false",
      includeBody: url.searchParams.get("log.includeBody") === "true",
      includeQuery: url.searchParams.get("log.includeQuery") !== "false",
    };

    // Validate request
    const validation = validateRequest(request);
    if (!validation.valid) {
      const response = NextResponse.json(
        { error: validation.error },
        { status: 413, headers: corsHeaders }
      );
      logRequest(request, response, logConfig);
      return response;
    }

    // Check rate limit
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimit = checkRateLimit(ip, rateLimitConfig);

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: rateLimitConfig.message },
        {
          status: rateLimitConfig.statusCode,
          headers: {
            ...corsHeaders,
            "Retry-After": Math.ceil(
              (rateLimit.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
      logRequest(request, response, logConfig);
      return response;
    }

    // Parse include parameter to determine which fields to include
    const includeParam = url.searchParams.get("include") || "ip";
    const includeFields = includeParam.split(",").map(field => field.trim());

    // Parse group parameter
    const groupParam = url.searchParams.get("group");
    const groups = groupParam ? groupParam.split(",").map(g => g.trim()) : [];

    // Get response data based on included fields
    const responseData = await getResponseData(request, includeFields);

    // Add timing information
    const endTime = Date.now();
    responseData.timing = {
      requestStart: startTime,
      requestEnd: endTime,
      processingTime: endTime - startTime,
    };

    // Add size information
    // Calculate total header size
    let headerSize = 0;
    request.headers.forEach((value, key) => {
      headerSize += key.length + value.length;
    });

    responseData.size = {
      headers: headerSize,
      body: request.headers.get("content-length")
        ? parseInt(request.headers.get("content-length")!, 10)
        : 0,
      total:
        headerSize +
        (request.headers.get("content-length")
          ? parseInt(request.headers.get("content-length")!, 10)
          : 0),
    };

    // Add rate limit information
    responseData.rateLimit = {
      remaining: rateLimit.remaining,
      reset: rateLimit.reset,
      limit: rateLimitConfig.max,
    };

    // Group fields if requested
    const finalData =
      groups.length > 0 ? groupFields(responseData, groups) : responseData;

    // Determine response format based on Accept header or format parameter
    const format =
      url.searchParams.get("format") ||
      request.headers.get("accept")?.split(",")[0] ||
      "text/plain";

    // Determine compression based on Accept-Encoding header
    const acceptEncoding = request.headers.get("accept-encoding") || "";
    const compression = acceptEncoding.includes("gzip")
      ? "gzip"
      : acceptEncoding.includes("deflate")
        ? "deflate"
        : "none";

    // Set response headers
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      "X-RateLimit-Limit": rateLimitConfig.max.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.reset.toString(),
    };

    // Add compression header if needed
    if (compression !== "none") {
      responseHeaders["Content-Encoding"] = compression;
    }

    // Add custom headers from query parameters
    url.searchParams.forEach((value, key) => {
      if (key.startsWith("header.")) {
        const headerName = key.slice(7); // Remove 'header.' prefix
        responseHeaders[headerName] = value;
      }
    });

    // Set status code if specified
    const statusCode = parseInt(url.searchParams.get("status") || "200", 10);
    if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
      const response = NextResponse.json(
        { error: "Invalid status code" },
        { status: 400, headers: responseHeaders }
      );
      logRequest(request, response, logConfig);
      return response;
    }

    // Format response based on requested format
    let responseBody: string;
    let contentType: string;

    if (format.includes("application/json")) {
      responseBody = JSON.stringify(finalData);
      contentType = "application/json";
    } else if (format.includes("application/xml")) {
      responseBody = formatXML(finalData);
      contentType = "application/xml";
    } else if (
      format.includes("application/yaml") ||
      format.includes("text/yaml")
    ) {
      responseBody = formatYAML(finalData);
      contentType = "application/yaml";
    } else if (format.includes("text/csv")) {
      responseBody = formatCSV(finalData);
      contentType = "text/csv";
    } else {
      responseBody = formatPlainText(finalData);
      contentType = "text/plain";
    }

    // Compress response if needed
    const compressedBody = await compressResponse(responseBody, compression);

    const response = new NextResponse(compressedBody, {
      status: statusCode,
      headers: {
        "Content-Type": contentType,
        ...responseHeaders,
      },
    });

    // Log the request
    logRequest(request, response, logConfig);

    return response;
  } catch (error) {
    console.error("Error in echo server:", error);
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    logRequest(request, response, { ...DEFAULT_LOG_CONFIG, level: "error" });
    return response;
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request);
}
