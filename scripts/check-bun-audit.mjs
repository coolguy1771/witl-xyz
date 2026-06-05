import { spawnSync } from "node:child_process";

const result = spawnSync("bun", ["audit", "--json"], { encoding: "utf8" });

// Fail if bun audit returned empty output or non-zero status without valid JSON
if (!result.stdout || !result.stdout.trim()) {
  console.error("bun audit produced empty output");
  console.error("Exit status:", result.status);
  console.error("stdout:", result.stdout);
  console.error("stderr:", result.stderr);
  process.exit(1);
}

let audit = {};
try {
  audit = JSON.parse(result.stdout.trim());
} catch (err) {
  console.error("Could not parse bun audit JSON output");
  console.error("Parse error:", err.message);
  console.error("Exit status:", result.status);
  console.error("stdout:", result.stdout);
  console.error("stderr:", result.stderr);
  process.exit(1);
}

let critical = 0;
let high = 0;

if (audit.metadata?.vulnerabilities) {
  critical = audit.metadata.vulnerabilities.critical ?? 0;
  high = audit.metadata.vulnerabilities.high ?? 0;
} else {
  for (const vulns of Object.values(audit)) {
    if (!Array.isArray(vulns)) continue;
    for (const entry of vulns) {
      if (entry.severity === "critical") critical += 1;
      if (entry.severity === "high") high += 1;
    }
  }
}

if (critical > 0 || high > 0) {
  console.error(`Found ${critical} critical and ${high} high vulnerabilities`);
  process.exit(1);
}

console.log("No critical or high severity vulnerabilities found");
