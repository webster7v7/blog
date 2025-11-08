import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/user/favorites?userId={userId}
// 获取用户收藏的文章列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 检查用户是否登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 只能查看自己的收藏（管理员可以查看任何人的）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (user.id !== userId && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取用户收藏的文章
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        post_slug,
        posts:post_slug (
          id,
          title,
          slug,
          excerpt,
          cover_image,
          published,
          published_at,
          created_at,
          updated_at,
          views,
          tags,
          category,
          comments_count,
          likes_count,
          favorites_count
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (favoritesError) {
      console.error('Error fetching favorites:', favoritesError);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    // 过滤掉已删除的文章
    const validFavorites = favorites?.filter((fav) => fav.posts !== null) || [];

    return NextResponse.json({
      favorites: validFavorites,
      count: validFavorites.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

