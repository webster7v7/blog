import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/external-links - 创建新的外链
export async function POST(request: NextRequest) {
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
    const { name, url, icon, order, is_visible } = body;

    // 验证必填字段
    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 创建外链
    const { data: link, error: insertError } = await supabase
      .from('external_links')
      .insert({
        name,
        url,
        icon: icon || null,
        order: order || 0,
        is_visible: is_visible !== undefined ? is_visible : true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating external link:', insertError);
      return NextResponse.json(
        { error: 'Failed to create external link' },
        { status: 500 }
      );
    }

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

