import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/comments?post_slug=xxx - 获取文章的所有评论
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const post_slug = searchParams.get('post_slug');

    if (!post_slug) {
      return NextResponse.json(
        { error: 'post_slug is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // 获取所有评论
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_slug', post_slug)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // 获取所有用户信息
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map((c: any) => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      // 将用户信息附加到评论中
      const profileMap = new Map(profiles?.map((p: any) => [p.id, {
        id: p.id,              // ✅ 明确添加 id 字段
        username: p.username,
        avatar_url: p.avatar_url
      }]) || []);
      comments.forEach((comment: any) => {
        const profile = profileMap.get(comment.user_id);
        comment.user = profile || { 
          id: comment.user_id,  // ✅ 回退时也包含 id
          username: '未知用户', 
          avatar_url: null 
        };
      });
    }

    // 组织评论为树形结构
    const commentMap = new Map();
    const rootComments: any[] = [];

    // 第一遍：创建所有评论的映射
    comments?.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // 第二遍：构建树形结构
    comments?.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // ✅ 添加缓存头：CDN缓存30秒，过期后1分钟内返回缓存+后台更新
    return NextResponse.json(
      { comments: rootComments },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
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

// POST /api/comments - 创建新评论
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient();

    // 检查用户是否登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { post_slug, content, parent_id } = body;

    // 验证必填字段
    if (!post_slug || !content) {
      return NextResponse.json(
        { error: 'post_slug and content are required' },
        { status: 400 }
      );
    }

    // 验证内容长度
    if (content.trim().length < 1 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be between 1 and 1000 characters' },
        { status: 400 }
      );
    }

    // 创建评论
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        post_slug,
        user_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // 获取用户信息
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single();

    // 将用户信息附加到评论中
    const commentWithUser = {
      ...comment,
      user: profile ? {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url
      } : { 
        id: user.id,           // ✅ 回退时也包含 id
        username: '未知用户', 
        avatar_url: null 
      }
    };

    return NextResponse.json({ comment: commentWithUser }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

