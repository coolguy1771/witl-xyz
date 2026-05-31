import { getPostSlugs } from "./fs-blog";
import { verifyTurnstileToken } from "./contact-mail";
import type { ServiceStatus, StatusCheckResult, StatusReport } from "./status-types";

export type { ServiceStatus, StatusCheckResult, StatusReport } from "./status-types";

const CHECK_TIMEOUT_MS = 5_000;
const PRODUCTION_URL = "https://witl.xyz";

async function timedCheck(
  name: string,
  run: () => Promise<{ status: ServiceStatus; message: string }>
): Promise<StatusCheckResult> {
  const started = Date.now();

  try {
    const result = await Promise.race([
      run(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), CHECK_TIMEOUT_MS)
      ),
    ]);

    return {
      name,
      status: result.status,
      latencyMs: Date.now() - started,
      message: result.message,
    };
  } catch (error) {
    return {
      name,
      status: "down",
      latencyMs: Date.now() - started,
      message: error instanceof Error ? error.message : "Check failed",
    };
  }
}

function overallStatus(checks: StatusCheckResult[]): ServiceStatus {
  if (checks.some((check) => check.status === "down")) {
    return "down";
  }
  if (checks.some((check) => check.status === "degraded")) {
    return "degraded";
  }
  return "operational";
}

async function checkBlogPosts(): Promise<{ status: ServiceStatus; message: string }> {
  const slugs = await getPostSlugs();
  if (slugs.length === 0) {
    return { status: "degraded", message: "No blog posts found" };
  }
  return { status: "operational", message: `${slugs.length} posts available` };
}

async function checkGitHubApi(): Promise<{ status: ServiceStatus; message: string }> {
  const response = await fetch("https://api.github.com/rate_limit", {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      status: response.status >= 500 ? "down" : "degraded",
      message: `GitHub API returned ${response.status}`,
    };
  }

  return { status: "operational", message: "GitHub API reachable" };
}

async function checkKvCache(): Promise<{ status: ServiceStatus; message: string }> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const kv = env.NEXT_INC_CACHE_KV;

    if (!kv) {
      return { status: "degraded", message: "KV binding not configured" };
    }

    await kv.get("__status_probe__");
    return { status: "operational", message: "ISR cache KV reachable" };
  } catch {
    return { status: "degraded", message: "KV check unavailable in this runtime" };
  }
}

async function checkProductionSite(): Promise<{ status: ServiceStatus; message: string }> {
  const response = await fetch(PRODUCTION_URL, {
    method: "HEAD",
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      status: response.status >= 500 ? "down" : "degraded",
      message: `Production returned ${response.status}`,
    };
  }

  return { status: "operational", message: "witl.xyz responding" };
}

async function checkResend(): Promise<{ status: ServiceStatus; message: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { status: "degraded", message: "RESEND_API_KEY not configured" };
  }

  const response = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    return { status: "down", message: "Resend API key rejected" };
  }

  if (!response.ok) {
    return {
      status: response.status >= 500 ? "down" : "degraded",
      message: `Resend API returned ${response.status}`,
    };
  }

  return { status: "operational", message: "Resend API reachable" };
}

async function checkTurnstile(): Promise<{ status: ServiceStatus; message: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { status: "degraded", message: "TURNSTILE_SECRET_KEY not configured" };
  }

  const verified = await verifyTurnstileToken("status-probe-invalid-token", null);
  if (verified) {
    return { status: "degraded", message: "Turnstile accepted invalid probe token" };
  }

  return { status: "operational", message: "Turnstile siteverify reachable" };
}

export async function runStatusChecks(): Promise<StatusReport> {
  const checks = await Promise.all([
    timedCheck("Site", async () => ({
      status: "operational" as const,
      message: "Worker responding",
    })),
    timedCheck("Production (witl.xyz)", checkProductionSite),
    timedCheck("Blog", checkBlogPosts),
    timedCheck("GitHub API", checkGitHubApi),
    timedCheck("ISR Cache (KV)", checkKvCache),
    timedCheck("Resend", checkResend),
    timedCheck("Turnstile", checkTurnstile),
  ]);

  return {
    status: overallStatus(checks),
    checkedAt: new Date().toISOString(),
    checks,
  };
}
