import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// POST /api/posts/[slug]/like - 点赞文章
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createServerClient();

    // 检查用户是否登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否已经点赞
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_slug', slug)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked' },
        { status: 400 }
      );
    }

    // 创建点赞记录
    const { error: insertError } = await supabase
      .from('likes')
      .insert({
        post_slug: slug,
        user_id: user.id,
      });

    if (insertError) {
      console.error('Error creating like:', insertError);
      return NextResponse.json(
        { error: 'Failed to like post' },
        { status: 500 }
      );
    }

    // 获取更新后的点赞数
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', slug);

    return NextResponse.json({ liked: true, count: count || 0 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[slug]/like - 取消点赞
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createServerClient();

    // 检查用户是否登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 删除点赞记录
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('post_slug', slug)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting like:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unlike post' },
        { status: 500 }
      );
    }

    // 获取更新后的点赞数
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', slug);

    return NextResponse.json({ liked: false, count: count || 0 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/posts/[slug]/like - 获取点赞状态
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createServerClient();

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 获取点赞总数
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', slug);

    // 如果用户已登录，检查是否已点赞
    let liked = false;
    if (user) {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_slug', slug)
        .eq('user_id', user.id)
        .single();

      liked = !!existingLike;
    }

    // ✅ 添加缓存头：CDN缓存5秒，过期后30秒内返回缓存+后台更新
    return NextResponse.json(
      { liked, count: count || 0 },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

