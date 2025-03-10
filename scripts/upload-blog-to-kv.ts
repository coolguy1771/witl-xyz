/**
 * This script uploads pre-computed blog data to Cloudflare KV.
 * Run this after build-blog.ts has generated the JSON files.
 * Usage: ts-node scripts/upload-blog-to-kv.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const BLOG_DATA_DIR = path.join(process.cwd(), '.open-next/assets/blog-data');
const KV_NAMESPACE = 'BLOG_POSTS';

async function run(): Promise<void> {
  console.log('Uploading blog data to Cloudflare KV...');
  
  // Ensure the blog data directory exists
  if (!fs.existsSync(BLOG_DATA_DIR)) {
    console.error(`Blog data directory not found: ${BLOG_DATA_DIR}`);
    console.error('Run "npm run build:blog" first to generate blog data');
    process.exit(1);
  }
  
  // Read all JSON files from the blog data directory
  const files = fs.readdirSync(BLOG_DATA_DIR);
  
  if (files.length === 0) {
    console.error('No JSON files found in the blog data directory');
    process.exit(1);
  }
  
  // Upload posts.json
  if (files.includes('posts.json')) {
    const postsPath = path.join(BLOG_DATA_DIR, 'posts.json');
    console.log('Uploading posts.json...');
    try {
      execSync(`wrangler kv:key put --binding=${KV_NAMESPACE} posts --path=${postsPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error uploading posts.json:', error);
      process.exit(1);
    }
  } else {
    console.error('posts.json not found');
    process.exit(1);
  }
  
  // Upload tags.json
  if (files.includes('tags.json')) {
    const tagsPath = path.join(BLOG_DATA_DIR, 'tags.json');
    console.log('Uploading tags.json...');
    try {
      execSync(`wrangler kv:key put --binding=${KV_NAMESPACE} tags --path=${tagsPath}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error uploading tags.json:', error);
      process.exit(1);
    }
  } else {
    console.error('tags.json not found');
    process.exit(1);
  }
  
  // Upload each post file
  const postFiles = files.filter(file => 
    file !== 'posts.json' && 
    file !== 'tags.json' && 
    file.endsWith('.json')
  );
  
  let uploadedCount = 0;
  let errorCount = 0;
  
  for (const file of postFiles) {
    const slug = file.replace(/\.json$/, '');
    const filePath = path.join(BLOG_DATA_DIR, file);
    console.log(`Uploading post: ${slug}...`);
    try {
      execSync(`wrangler kv:key put --binding=${KV_NAMESPACE} "post:${slug}" --path=${filePath}`, { stdio: 'inherit' });
      uploadedCount++;
    } catch (error) {
      console.error(`Error uploading ${file}:`, error);
      errorCount++;
    }
  }
  
  console.log(`
✅ Blog data upload complete:
- ${uploadedCount} posts uploaded successfully
- ${errorCount} posts failed to upload
`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

run().catch(error => {
  console.error('Error uploading blog data:', error);
  process.exit(1);
});