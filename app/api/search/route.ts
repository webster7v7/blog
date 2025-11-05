import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { searchPosts } from '@/lib/search';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags, content')
      .eq('published', true);

    if (error) {
      console.error('Error fetching posts for search:', error);
      return NextResponse.json(
        { error: 'Failed to search posts' },
        { status: 500 }
      );
    }

    const results = searchPosts(query, data || []);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

