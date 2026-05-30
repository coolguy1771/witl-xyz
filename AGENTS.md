## Learned User Preferences

- Use Bun for package management, scripts, and CI instead of npm, yarn, or pnpm.
- Prefer minimal, surgical changes; verify review or audit findings against current code before fixing.
- When addressing review feedback, fix only still-valid issues and skip the rest with a brief reason.
- Commit and push when explicitly asked (e.g. "commit and push", "do it").

## Learned Workspace Facts

- Next.js 16 portfolio/blog (`witl-xyz`) deployed to Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`).
- Production site: https://witl.xyz; Cloudflare Worker name `witl-xyz`.
- Package manager: Bun 1.3.9 (`bun.lock`, `.bun-version`, `packageManager` in `package.json`).
- Deploy with `opennextjs-cloudflare build && wrangler deploy`; avoid a separate `next build` before OpenNext.
- `next.config.ts` must set `output: "standalone"` for reliable OpenNext builds under Bun.
- Bun is toolchain-only; production runs Cloudflare V8/Workers, not the Bun runtime.
- Blog posts live in `posts/` and load through `src/app/lib/fs-blog.ts` with markdown frontmatter.
- Styling uses MUI v9 plus Tailwind CSS v4; components export from `src/app/components/index.ts`.
- Renovate is Bun-first; npm, yarn, and pnpm managers are disabled.
- Security headers use nonce-based CSP in `src/middleware.ts`; GitHub data is fetched server-side via `/api/github/projects`.
- CI uses `oven-sh/setup-bun` with `bun install --frozen-lockfile`; Playwright tests run with `bun run test`.
