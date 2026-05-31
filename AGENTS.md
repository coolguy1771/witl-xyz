# Learned User Preferences

- Use Bun for package management, scripts, and CI instead of npm, yarn, or pnpm.
- Prefer minimal, surgical changes; verify review or audit findings against current code before fixing.
- When addressing review feedback, fix only still-valid issues and skip the rest with a brief reason.
- Commit and push when explicitly asked (e.g. "commit and push", "do it").

# Learned Workspace Facts

- Next.js 16 portfolio/blog (`witl-xyz`) deployed to Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`).
- Production site: https://witl.xyz; Cloudflare Worker name `witl-xyz`.
- Package manager: Bun 1.3.9 (`bun.lock`, `.bun-version`, `packageManager` in `package.json`).
- Deploy with `bun run build:worker && wrangler deploy`; validate Worker config with `bun run check:worker` (`wrangler deploy --dry-run`).
- `next.config.ts` must set `output: "standalone"` for reliable OpenNext builds under Bun.
- Bun is toolchain-only; production runs Cloudflare V8/Workers, not the Bun runtime.
- Content: blog posts in `posts/` via `src/app/lib/fs-blog.ts`; `/now` page from `content/now.md`; SEO via `src/app/sitemap.ts` and `src/app/robots.ts`.
- Styling uses MUI v9 plus Tailwind CSS v4; `ThemeRegistry` uses `@mui/material-nextjs` `AppRouterCacheProvider`; components export from `src/app/components/index.ts`.
- Renovate is Bun-first; npm, yarn, and pnpm managers are disabled.
- Nonce CSP in `src/middleware.ts` sets CSP on request headers; root layout uses `connection()` for per-request nonces; blog pages are dynamic (no ISR/static params).
- Contact form uses Cloudflare Turnstile + Resend (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`); `/you` weather from Open-Meteo server-side; blog OG images via `opengraph-image.tsx` only (no duplicate `opengraph-image/route.tsx`).
- CI uses `oven-sh/setup-bun` with `bun install --frozen-lockfile`; Playwright runs with `bun run test` after `bunx playwright install --with-deps chromium`; mobile specs under `tests/mobile/**` run only on the `mobile-chrome` project.
- `wrangler.json` needs base `nodejs_compat` for `node:fs`; KV binding `NEXT_INC_CACHE_KV` serves OpenNext ISR and API rate limits (`__ratelimit:` prefix); Grafana OTLP destinations are `grafana-traces` (logs) and `witl-xyz-grafana-traces` (traces).
