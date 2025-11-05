import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/comments/[id] - 更新评论
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // 检查用户是否登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    // 验证内容
    if (!content || content.trim().length < 1 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be between 1 and 1000 characters' },
        { status: 400 }
      );
    }

    // 更新评论（RLS 会自动检查权限）
    const { data: comment, error: updateError } = await supabase
      .from('comments')
      .update({ content: content.trim() })
      .eq('id', id)
      .eq('user_id', user.id) // 确保只能更新自己的评论
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          username,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      );
    }

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - 删除评论
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // 检查用户是否登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 删除评论（RLS 会自动检查权限）
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // 确保只能删除自己的评论

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

