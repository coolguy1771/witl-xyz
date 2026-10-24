/**
 * Dev runner: compiles the blog once, then runs the post watcher next to `next dev`
 * so edits in posts/ show up on refresh.
 */

import { spawn, spawnSync } from "child_process";

const initial = spawnSync("bun", ["scripts/compile-blog.ts"], { stdio: "inherit" });
if (initial.status !== 0) process.exit(initial.status ?? 1);

const children = [
  spawn("bun", ["scripts/compile-blog.ts", "--watch"], { stdio: "inherit" }),
  spawn("next", ["dev", "--turbopack"], { stdio: "inherit" }),
];

function shutdown(code: number): void {
  for (const child of children) child.kill();
  process.exit(code);
}

process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));

// next dev is the long-running process; if it exits, stop the watcher too.
children[1].on("exit", (code) => shutdown(code ?? 0));
