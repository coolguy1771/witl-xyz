/**
 * Build blog maps for navigation and API data
 * 
 * This script creates JSON maps of blog posts and tags without full content.
 * These maps can be used for navigation, listing pages, and API routes
 * without requiring filesystem access.
 * 
 * @typedef {Object} PostFrontmatter
 * @property {string} title - The post title
 * @property {string} date - The post date
 * @property {string[]} [tags] - Optional tags for the post
 * @property {string} [excerpt] - Optional custom excerpt
 * @property {string} [coverImage] - Optional cover image URL
 * @property {boolean} [featured] - Whether the post is featured
 * @property {Object} [author] - Post author information
 * @property {string} [author.name] - Author name
 * @property {string} [author.image] - Author image URL
 * 
 * @typedef {Object} BlogPostMetadata
 * @property {string} slug - The post slug
 * @property {string} title - The post title
 * @property {string} date - The post date
 * @property {string[]} tags - Post tags
 * @property {string} excerpt - Post excerpt
 * @property {string} readingTime - Estimated reading time
 * @property {string} [coverImage] - Optional cover image URL
 * @property {boolean} [featured] - Whether the post is featured
 * @property {Object} [author] - Post author information
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/** @type {string} Directory containing markdown blog posts */
const POSTS_DIRECTORY = path.join(process.cwd(), 'posts');

/** @type {string} Output directory for generated JSON maps */
const OUTPUT_DIRECTORY = path.join(process.cwd(), 'public/blog-maps');

/** @type {number} Words per minute for reading time calculation */
const WORDS_PER_MINUTE = 200;

/** @type {number} Maximum length for auto-generated excerpts */
const EXCERPT_LENGTH = 200;

// Ensure output directory exists with proper error handling
try {
  const outputDirStat = fs.statSync(OUTPUT_DIRECTORY);
  
  if (!outputDirStat.isDirectory()) {
    console.warn(`Output path ${OUTPUT_DIRECTORY} exists but is not a directory. Attempting to remove it...`);
    fs.unlinkSync(OUTPUT_DIRECTORY);
    fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIRECTORY}`);
  } else {
    console.log(`Output directory already exists: ${OUTPUT_DIRECTORY}`);
    
    // Clear existing files for a clean build
    const existingFiles = fs.readdirSync(OUTPUT_DIRECTORY);
    if (existingFiles.length > 0) {
      console.log(`Clearing ${existingFiles.length} existing files from output directory...`);
      existingFiles.forEach(file => {
        const filePath = path.join(OUTPUT_DIRECTORY, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log(`Output directory doesn't exist, creating: ${OUTPUT_DIRECTORY}`);
    try {
      fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
      console.log(`Created output directory: ${OUTPUT_DIRECTORY}`);
    } catch (mkdirError) {
      console.error(`Error creating output directory: ${mkdirError.message}`);
      throw mkdirError;
    }
  } else {
    console.error(`Error checking output directory: ${error.message}`);
    throw error;
  }
}

/**
 * Processes blog posts and builds metadata maps
 * @returns {Promise<void>}
 */
async function buildBlogMaps() {
  console.log('Building blog maps...');
  console.log(`Posts directory: ${POSTS_DIRECTORY}`);
  console.log(`Output directory: ${OUTPUT_DIRECTORY}`);
  
  // Check if posts directory exists
  try {
    const postsDirStat = fs.statSync(POSTS_DIRECTORY);
    
    if (!postsDirStat.isDirectory()) {
      throw new Error(`${POSTS_DIRECTORY} exists but is not a directory`);
    }
    
    console.log(`Found posts directory at ${POSTS_DIRECTORY}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`Posts directory not found: ${POSTS_DIRECTORY}`);
      console.log('Creating posts directory and sample post...');
      
      // Create posts directory
      fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
      
      // Create a sample post file
      const samplePostPath = path.join(POSTS_DIRECTORY, 'sample-post.md');
      const samplePostContent = `---
title: Sample Blog Post
date: ${new Date().toISOString().split('T')[0]}
tags: [sample, blog]
---

# Welcome to My Blog

This is a sample blog post created automatically during build.

## Features

- Markdown formatting
- Code highlighting
- And more...
`;
      fs.writeFileSync(samplePostPath, samplePostContent);
      console.log(`Created sample post at ${samplePostPath}`);
    } else {
      console.error(`Error accessing posts directory: ${error.message}`);
      throw error;
    }
  }
  
  // Get all markdown files with better error handling
  let filenames = [];
  try {
    filenames = fs.readdirSync(POSTS_DIRECTORY);
    console.log(`Found ${filenames.length} files in posts directory`);
  } catch (error) {
    console.error(`Error reading posts directory: ${error.message}`);
    throw error;
  }
  
  const markdownFiles = filenames.filter(file => file.endsWith('.md'));
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  if (markdownFiles.length === 0) {
    console.warn('No markdown files found in posts directory');
    
    // Create a sample post if none exist
    console.log('Creating a sample post...');
    const samplePostPath = path.join(POSTS_DIRECTORY, 'sample-post.md');
    const samplePostContent = `---
title: Sample Blog Post
date: ${new Date().toISOString().split('T')[0]}
tags: [sample, blog]
---

# Welcome to My Blog

This is a sample blog post created automatically during build.

## Features

- Markdown formatting
- Code highlighting
- And more...
`;
    fs.writeFileSync(samplePostPath, samplePostContent);
    console.log(`Created sample post at ${samplePostPath}`);
    
    // Update the list of markdown files
    markdownFiles.push('sample-post.md');
  }
  
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  // Process each file for metadata
  /** @type {BlogPostMetadata[]} */
  const allPosts = [];
  
  /** @type {string[]} */
  const slugs = [];
  
  for (const filename of markdownFiles) {
    const filePath = path.join(POSTS_DIRECTORY, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Parse frontmatter
      const { data, content } = matter(fileContent);
      /** @type {PostFrontmatter} */
      const frontmatter = data;
      
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
      slugs.push(slug);
      
      // Calculate reading time
      const wordCount = content.split(/\s+/g).length;
      const readingTime = `${Math.ceil(wordCount / WORDS_PER_MINUTE)} min read`;
      
      // Create excerpt if not provided
      const excerpt = frontmatter.excerpt || 
        content.slice(0, EXCERPT_LENGTH).replace(/[#*`]/g, '') + '...';
      
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
      
      console.log(`✓ Processed metadata: ${slug}`);
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }
  
  // Sort posts by date (newest first)
  allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Helper function to safely write JSON files
  /**
   * @param {string} filename The name of the file to write
   * @param {any} data The data to serialize and write
   * @returns {boolean} Success status
   */
  function safeWriteJson(filename, data) {
    const filePath = path.join(OUTPUT_DIRECTORY, filename);
    try {
      // Create indented JSON for better readability if needed
      const jsonString = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonString);
      console.log(`Successfully wrote ${filename} (${(jsonString.length / 1024).toFixed(2)} KB)`);
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}: ${error.message}`);
      return false;
    }
  }
  
  // Generate and save all files
  console.log('Saving blog maps...');
  
  // Save all posts metadata
  safeWriteJson('posts.json', allPosts);
  
  // Save slugs for route generation
  safeWriteJson('slugs.json', slugs);
  
  // Generate tags mapping
  /** @type {Record<string, string[]>} */
  const tags = {};
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
  safeWriteJson('tags.json', tags);
  
  // Save a status file with build info
  safeWriteJson('meta.json', {
    buildTime: new Date().toISOString(),
    postCount: allPosts.length,
    tagCount: Object.keys(tags).length,
    environment: process.env.NODE_ENV || 'development'
  });
  
  console.log(`✅ Blog maps built successfully! ${allPosts.length} posts processed.`);
  console.log(`📁 Output directory: ${OUTPUT_DIRECTORY}`);
  
  // List all created files for verification
  const outputFiles = fs.readdirSync(OUTPUT_DIRECTORY);
  console.log("Generated files:");
  outputFiles.forEach(file => {
    const filePath = path.join(OUTPUT_DIRECTORY, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
}

buildBlogMaps().catch(error => {
  console.error('Error building blog maps:', error);
  process.exit(1);
});