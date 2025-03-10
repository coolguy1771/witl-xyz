# Personal Blog and Portfolio

A modern, responsive blog and portfolio website built with Next.js 15, featuring dark mode, markdown blog posts, dynamic content, and deployed on cloudflare workers

## Features

- ⚡️ Built with Next.js 15 and TypeScript
- 🎨 Dark theme with custom styling
- 📝 Markdown blog posts with frontmatter
- 📑 Table of contents with active section highlighting
- 💻 Code syntax highlighting with copy functionality
- 🔗 Previous/Next post navigation
- 📱 Fully responsive design
- 🎭 Custom fonts (Geist Sans & Geist Mono)
- 🚀 Fast page loads with static generation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/coolguy1771/witl-xyz.git
cd witl-xyz
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Blog Posts

Blog posts are written in Markdown and stored in the `posts` directory. Each post should include frontmatter with the following fields:

```markdown
---
title: Your Post Title
date: '2025-01-15'
author: Your Name
tags: ['nextjs', 'react', 'typescript']
excerpt: Optional custom excerpt for your post
---

Your content here...
```

### Supported Markdown Features

- Headers (h1-h6)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Images
- Links
- Blockquotes
- Tables
- And more...

## Project Structure

```
.
├── app/
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── CodeBlock.tsx
│   │   │   └── TableOfContents.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── Navbar.tsx
│   ├── fonts/
│   ├── lib/
│   │   └── fs-blog.ts       # Filesystem-based blog implementation
│   └── types/
├── posts/                   # Markdown blog posts
├── public/
└── package.json
```

## Customization

### Adding New Posts

1. Create a new markdown file in the `posts` directory
2. Include the required frontmatter
3. Write your content in markdown
4. The post will be automatically added to the blog listing

### Styling

- Global styles are in `app/globals.css`
- Components use Tailwind CSS for styling
- Dark theme colors can be customized in the CSS variables

## Built With

- [Next.js 15](https://nextjs.org/) - The React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - Frontmatter parsing
- [remark](https://github.com/remarkjs/remark) - Markdown processing
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless deployment
- [Cloudflare Assets](https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#assets) - Static file serving

## Cloudflare Deployment

This project is configured to work with Cloudflare Workers. Thanks to Next.js static generation, all blog pages are pre-rendered at build time.

The blog functionality works by:
1. Reading Markdown files from the `/posts` directory during build
2. Pre-rendering the content into static HTML
3. Deploying these static pages to Cloudflare

### Setup for Cloudflare

Simply build and deploy:
```bash
npm run deploy
```

The filesystem access only happens during build time, not in production. Next.js ensures that all necessary content is pre-generated and packaged within the static assets.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
