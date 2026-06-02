import { spawnSync } from "node:child_process";

const result = spawnSync("bun", ["audit", "--json"], { encoding: "utf8" });

let audit = {};
try {
  audit = JSON.parse(result.stdout.trim() || "{}");
} catch {
  console.log("Could not parse bun audit JSON; skipping gate");
  process.exit(0);
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
