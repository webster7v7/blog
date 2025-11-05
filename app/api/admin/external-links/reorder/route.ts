import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/admin/external-links/reorder - 批量更新外链排序
export async function PATCH(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { links } = body;

    // 验证数据格式
    if (!Array.isArray(links)) {
      return NextResponse.json(
        { error: 'Links must be an array' },
        { status: 400 }
      );
    }

    // 批量更新排序
    const updates = links.map((link: { id: string; order: number }) =>
      supabase
        .from('external_links')
        .update({ order: link.order })
        .eq('id', link.id)
    );

    const results = await Promise.all(updates);

    // 检查是否有错误
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      console.error('Error updating order:', errors);
      return NextResponse.json(
        { error: 'Failed to update some links' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

