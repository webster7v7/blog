import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// POST /api/posts/[slug]/favorite - 收藏文章
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

    // 检查是否已经收藏
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('post_slug', slug)
      .eq('user_id', user.id)
      .single();

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Already favorited' },
        { status: 400 }
      );
    }

    // 创建收藏记录
    const { error: insertError } = await supabase
      .from('favorites')
      .insert({
        post_slug: slug,
        user_id: user.id,
      });

    if (insertError) {
      console.error('Error creating favorite:', insertError);
      return NextResponse.json(
        { error: 'Failed to favorite post' },
        { status: 500 }
      );
    }

    // 获取更新后的收藏数
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', slug);

    return NextResponse.json({ favorited: true, count: count || 0 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[slug]/favorite - 取消收藏
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

    // 删除收藏记录
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('post_slug', slug)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting favorite:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unfavorite post' },
        { status: 500 }
      );
    }

    // 获取更新后的收藏数
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', slug);

    return NextResponse.json({ favorited: false, count: count || 0 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/posts/[slug]/favorite - 获取收藏状态
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const supabase = await createServerClient();

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 获取收藏总数
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', slug);

    // 如果用户已登录，检查是否已收藏
    let favorited = false;
    if (user) {
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_slug', slug)
        .eq('user_id', user.id)
        .single();

      favorited = !!existingFavorite;
    }

    // ✅ 添加缓存头：CDN缓存5秒，过期后30秒内返回缓存+后台更新
    return NextResponse.json(
      { favorited, count: count || 0 },
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

