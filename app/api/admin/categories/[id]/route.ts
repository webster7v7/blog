import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/admin/categories/[id] - 更新分类
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
    const { name, slug, description, color, icon, order_index } = body;

    // 如果更新了 slug，检查是否与其他分类冲突
    if (slug) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // 更新分类
    const { data: category, error: updateError } = await supabase
      .from('categories')
      .update({
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(icon !== undefined && { icon }),
        ...(order_index !== undefined && { order_index }),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating category:', updateError);
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - 删除分类
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

    // 获取分类的 slug
    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', id)
      .single();

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // 检查是否有文章使用此分类
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('category', category.slug);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. ${count} post(s) are using this category.` },
        { status: 400 }
      );
    }

    // 删除分类
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting category:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

