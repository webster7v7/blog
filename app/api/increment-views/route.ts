import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 获取当前文章
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('views')
      .eq('slug', slug)
      .single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // 更新阅读数
    const { data, error: updateError } = await supabase
      .from('posts')
      .update({ views: post.views + 1 })
      .eq('slug', slug)
      .select('views')
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update views' },
        { status: 500 }
      );
    }

    return NextResponse.json({ views: data.views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

