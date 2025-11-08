import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/user/likes?userId={userId}
// 获取用户点赞的文章列表
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

    // 只能查看自己的点赞（管理员可以查看任何人的）
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (user.id !== userId && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取用户点赞的文章
    const { data: likes, error: likesError } = await supabase
      .from('likes')
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

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return NextResponse.json(
        { error: 'Failed to fetch likes' },
        { status: 500 }
      );
    }

    // 过滤掉已删除的文章
    const validLikes = likes?.filter((like) => like.posts !== null) || [];

    return NextResponse.json({
      likes: validLikes,
      count: validLikes.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

