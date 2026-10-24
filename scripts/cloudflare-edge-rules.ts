/**
 * Applies edge security headers and WAF rules to the witl.xyz zone.
 *
 *   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ZONE_ID=... bun scripts/cloudflare-edge-rules.ts [--apply]
 *
 * Dry run by default (prints the rulesets). Token needs Zone > Transform Rules:Edit
 * and Zone > Zone WAF:Edit. PUT replaces the zone's ruleset for that phase, so
 * run the dry run and compare against the dashboard first.
 */

const token = process.env.CLOUDFLARE_API_TOKEN;
const zone = process.env.CLOUDFLARE_ZONE_ID;
const apply = process.argv.includes("--apply");

// Static headers only. The nonce-based CSP stays in src/middleware.ts.
const responseHeaders = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

const rulesets = [
  {
    phase: "http_response_headers_transform",
    rules: [
      {
        description: "Static security headers",
        expression: 'http.host eq "witl.xyz"',
        action: "rewrite",
        action_parameters: {
          headers: Object.fromEntries(
            Object.entries(responseHeaders).map(([name, value]) => [
              name,
              { operation: "set", value },
            ])
          ),
        },
      },
    ],
  },
  {
    phase: "http_request_firewall_custom",
    rules: [
      {
        description: "Block non-GET/HEAD/OPTIONS to API (read-only API)",
        expression:
          'starts_with(http.request.uri.path, "/api/") and not http.request.method in {"GET" "HEAD" "OPTIONS"}',
        action: "block",
      },
    ],
  },
];

for (const { phase, rules } of rulesets) {
  console.log(`\n# ${phase}\n${JSON.stringify(rules, null, 2)}`);
  if (!apply) continue;
  if (!token || !zone) throw new Error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zone}/rulesets/phases/${phase}/entrypoint`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    }
  );
  if (!res.ok) throw new Error(`${phase} FAILED ${res.status}: ${await res.text()}`);
  console.log("applied");
}

if (!apply) console.log("\nDry run. Re-run with --apply to push.");

export {};
