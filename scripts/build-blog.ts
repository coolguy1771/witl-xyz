import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { remark } from 'remark';
import html from 'remark-html';

interface PostFrontmatter {
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
  coverImage?: string;
  featured?: boolean;
  author?: {
    name: string;
    image?: string;
  };
}

interface BlogPost {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  headings: Array<{
    level: number;
    id: string;
    text: string;
  }>;
  excerpt: string;
}

interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  readingTime?: string;
  coverImage?: string;
  featured?: boolean;
  author?: {
    name: string;
    image?: string;
  };
}

const POSTS_DIRECTORY = path.join(process.cwd(), 'posts');
const OUTPUT_DIRECTORY = path.join(process.cwd(), '.open-next/assets/blog-data');
const WORDS_PER_MINUTE = 200;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIRECTORY)) {
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
}

async function processMarkdown(content: string): Promise<string> {
  // First try with the remark-rehype pipeline for better HTML
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings)
      .use(rehypeStringify)
      .process(content);
    
    let contentHtml = result.toString();
    
    // Add language classes to code blocks for syntax highlighting
    contentHtml = contentHtml.replace(
      /<pre><code class="language-([^"]+)">/g, 
      '<pre class="language-$1"><code class="language-$1">'
    );
    
    return contentHtml;
  } catch (error) {
    console.error('Error using unified processor, falling back to remark-html:', error);
    
    // Fallback to simpler remark-html pipeline
    const processedContent = await remark()
      .use(html, { sanitize: false })
      .process(content);
    
    let contentHtml = processedContent.toString();
    
    // Add language classes to code blocks
    contentHtml = contentHtml.replace(
      /<pre><code class="language-([^"]+)">/g, 
      '<pre class="language-$1"><code class="language-$1">'
    );
    
    // Add IDs to headings for TOC linking
    contentHtml = contentHtml.replace(
      /<h([2-3])>(.*?)<\/h\1>/g,
      (match, level, content) => {
        const id = content
          .toLowerCase()
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/[^\w\s-]/g, '') // Remove special chars
          .replace(/\s+/g, '-'); // Replace spaces with hyphens
        return `<h${level} id="${id}">${content}</h${level}>`;
      }
    );
    
    return contentHtml;
  }
}

async function buildBlogData(): Promise<void> {
  console.log('Building blog data...');
  
  // Get all markdown files
  const filenames = fs.readdirSync(POSTS_DIRECTORY);
  const markdownFiles = filenames.filter(file => file.endsWith('.md'));
  
  if (markdownFiles.length === 0) {
    console.warn('No markdown files found in', POSTS_DIRECTORY);
    return;
  }
  
  // Process each file
  const allPosts: BlogPostMetadata[] = [];
  
  for (const filename of markdownFiles) {
    const filePath = path.join(POSTS_DIRECTORY, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Parse frontmatter
      const { data, content } = matter(fileContent);
      const frontmatter = data as PostFrontmatter;
      
      // Validate required fields
      if (!frontmatter.title) {
        console.warn(`Missing title in post: ${filename}, skipping`);
        continue;
      }
      
      if (!frontmatter.date) {
        console.warn(`Missing date in post: ${filename}, skipping`);
        continue;
      }
      
      // Get slug from filename
      const slug = filename.replace(/\.md$/, '');
      
      // Process markdown to HTML
      const html = await processMarkdown(content);
      
      // Calculate reading time
      const wordCount = content.split(/\s+/g).length;
      const readingTime = `${Math.ceil(wordCount / WORDS_PER_MINUTE)} min read`;
      
      // Create excerpt if not provided
      const excerpt = frontmatter.excerpt || 
        content.slice(0, 200).replace(/[#*`]/g, '') + '...';
      
      // Extract headings for table of contents
      const headings = [];
      const headingRegex = /<h([2-6]) id="([^"]+)">(.*?)<\/h\1>/g;
      let match;
      while ((match = headingRegex.exec(html)) !== null) {
        headings.push({
          level: parseInt(match[1]),
          id: match[2],
          text: match[3].replace(/<[^>]*>/g, '') // Remove HTML tags
        });
      }
      
      // Create post object
      const post: BlogPost = {
        slug,
        frontmatter,
        content: html,
        headings,
        excerpt,
      };
      
      // Save individual post data
      fs.writeFileSync(
        path.join(OUTPUT_DIRECTORY, `${slug}.json`),
        JSON.stringify(post)
      );
      
      // Add metadata to all posts list
      allPosts.push({
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        tags: frontmatter.tags || [],
        excerpt,
        readingTime,
        coverImage: frontmatter.coverImage,
        featured: frontmatter.featured,
        author: frontmatter.author
      });
      
      console.log(`✓ Processed: ${slug}`);
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }
  
  // Sort posts by date (newest first)
  allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Save all posts metadata
  fs.writeFileSync(
    path.join(OUTPUT_DIRECTORY, 'posts.json'),
    JSON.stringify(allPosts)
  );
  
  // Generate tags mapping
  const tags: Record<string, string[]> = {};
  allPosts.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => {
        if (!tags[tag]) {
          tags[tag] = [];
        }
        tags[tag].push(post.slug);
      });
    }
  });
  
  // Save tags data
  fs.writeFileSync(
    path.join(OUTPUT_DIRECTORY, 'tags.json'),
    JSON.stringify(tags)
  );
  
  console.log(`✅ Blog data built successfully! ${allPosts.length} posts processed.`);
  console.log(`📁 Output directory: ${OUTPUT_DIRECTORY}`);
}

buildBlogData().catch(error => {
  console.error('Error building blog data:', error);
  process.exit(1);
});