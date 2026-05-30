# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Preview worker locally
npm run preview:worker

# Run tests
npm run test

# Run a specific test file
npm run test -- path/to/test.spec.ts
```

## Architecture Overview

This is a Next.js 16 portfolio and blog site deployed on Cloudflare Workers using OpenNext.js.

### Key Architectural Decisions

1. **App Router Structure**: Uses Next.js App Router with TypeScript for all pages and components.

2. **Styling**: Dual approach with Material-UI (MUI) v9 for components and Tailwind CSS v4 for utility classes. Emotion handles CSS-in-JS.

3. **Blog System**: Markdown-based with frontmatter metadata. Posts are stored in `posts/` and processed through:
   - `src/app/lib/fs-blog.ts` - Filesystem post loading
   - `src/app/lib/blog.ts` - Blog processing utilities
   - `src/app/lib/blog-cf.ts` - Cloudflare-specific blog utilities
   - Syntax highlighting via highlight.js
   - Table of contents auto-generation

4. **API Routes**: Located in `src/app/api/` handling:
   - Blog operations (posts, tags, search)
   - Visitor tracking and analytics

5. **State Management**: React hooks and context for local state. No global state management library.

6. **Cloudflare Integration**: 
   - Uses `@opennextjs/cloudflare` adapter
   - KV storage for caching
   - Custom middleware for security headers and rate limiting
   - Worker-specific configurations in `worker-configuration.d.ts`

### Important Patterns

- **Components**: Export from `src/app/components/index.ts` for cleaner imports
- **Types**: Centralized in `src/app/types/` and `src/types/`
- **Utilities**: Split between `src/app/lib/` (app-specific) and `src/utils/` (general)
- **Theme**: Custom theme configuration in `src/app/lib/theme.ts` integrating MUI with Tailwind
- **Hooks**: Custom hooks in `src/hooks/` for reusable logic

### Testing Approach

Playwright E2E tests cover critical user paths. Test files are in `tests/` directory. Tests run against multiple browsers (Chrome, Firefox, Safari).

### Security Considerations

- Content Security Policy headers configured
- Rate limiting on API routes
- Input validation on all user inputs
- Regular dependency updates via Renovate
- Security scanning with CodeQL and dependency review

## CI/CD Pipelines

### Available Workflows

1. **CI/CD Pipeline (`ci.yml`)**: Runs on PRs and pushes to main
   - Code quality checks (linting, type checking)
   - Playwright tests across multiple browsers
   - Build validation
   - NPM security audit

2. **Deployment (`deploy.yml`)**: Automated deployments
   - Staging: Auto-deploys on push to main
   - Production: Manual trigger with approval required
   - Includes cache purging and deployment tracking

3. **Performance Monitoring (`performance.yml`)**: Runs on PRs
   - Bundle size analysis
   - Lighthouse CI for Core Web Vitals
   - Build time tracking

4. **Security Scanning (`security.yml`)**: Comprehensive security checks
   - Secret scanning with Trufflehog
   - NPM vulnerability audit
   - License compliance checking
   - SAST with Semgrep

### Required Secrets

Configure these in GitHub repository settings:
- `CLOUDFLARE_API_TOKEN`: For Worker deployments
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_ZONE_ID`: For cache purging