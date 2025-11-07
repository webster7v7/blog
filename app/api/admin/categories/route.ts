import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/admin/categories - 获取所有分类
export async function GET() {
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

    // ✅ 优化：使用 RPC 函数消除 N+1 查询问题
    // 从 2 次查询 + 内存聚合 → 1 次 RPC (50% 性能提升)
    const { data: categories, error: categoriesError } = await supabase
      .rpc('get_categories_with_count');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/categories - 创建新分类
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
    const { name, slug, description, color, icon, order_index } = body;

    // 验证必填字段
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    // 创建分类
    const { data: category, error: createError } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        color: color || '#8B5CF6',
        icon: icon || null,
        order_index: order_index || 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating category:', createError);
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

