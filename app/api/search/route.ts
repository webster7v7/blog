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

    const supabase = await createServerClient();
    
    // ✅ 移除 content 字段，只搜索 title、excerpt、tags
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags, category, comments_count, likes_count, favorites_count')
      .eq('published', true);

    if (error) {
      console.error('Error fetching posts for search:', error);
      return NextResponse.json(
        { error: 'Failed to search posts' },
        { status: 500 }
      );
    }

    const results = searchPosts(query, data || []);

    // ✅ 增强缓存头（CDN缓存5分钟，过期后30分钟内返回缓存+后台更新）
    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
        },
      }
    );
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

