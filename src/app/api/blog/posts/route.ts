import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPostsByTags, getFeaturedPosts } from '@/app/lib/blog-static';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const tagsParam = searchParams.get('tags');
    const limitParam = searchParams.get('limit');
    const featuredParam = searchParams.get('featured');
    
    let posts;
    
    // Filter by featured status if requested
    if (featuredParam === 'true') {
      posts = await getFeaturedPosts();
    } 
    // Filter by tags if provided
    else if (tagsParam) {
      const tags = tagsParam.split(',').map(tag => tag.trim());
      posts = await getPostsByTags(tags);
    } 
    // Otherwise get all posts
    else {
      posts = await getAllPosts();
    }
    
    // Limit results if requested
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    if (limit && !isNaN(limit) && limit > 0) {
      posts = posts.slice(0, limit);
    }
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in /api/blog/posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}