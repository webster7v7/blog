import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/admin/external-links/[id] - 更新外链
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

    const body = await request.json();
    const { name, url, icon, order, is_visible } = body;

    // 准备更新数据
    const updateData: Partial<{
      name: string;
      url: string;
      icon: string;
      order: number;
      is_visible: boolean;
    }> = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) {
      // 验证 URL 格式
      try {
        new URL(url);
        updateData.url = url;
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    }
    if (icon !== undefined) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;
    if (is_visible !== undefined) updateData.is_visible = is_visible;

    // 更新外链
    const { data: link, error: updateError } = await supabase
      .from('external_links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating external link:', updateError);
      return NextResponse.json(
        { error: 'Failed to update external link' },
        { status: 500 }
      );
    }

    if (!link) {
      return NextResponse.json(
        { error: 'External link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ link });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/external-links/[id] - 删除外链
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

    // 检查是否是管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 删除外链
    const { error: deleteError } = await supabase
      .from('external_links')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting external link:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete external link' },
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

