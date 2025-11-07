import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

    // 检查是否是管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 防止管理员修改自己的角色
    if (user.id === id) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 400 }
      );
    }

    // 解析请求体
    const { role } = await request.json();

    // 验证角色
    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // 更新用户角色
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: updatedProfile });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

