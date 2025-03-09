import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug, extractHeadingsFromContent } from '@/app/lib/blog';

export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    if (!params.slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }
    
    const post = await getPostBySlug(params.slug);
    
    // Extract headings for table of contents if not already present
    if (!post.headings) {
      post.headings = extractHeadingsFromContent(post.content);
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error(`Error in /api/blog/posts/${params.slug}:`, error);
    
    // Check if this is a "post not found" error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: `Post not found: ${params.slug}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
