import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/posts - 创建新文章
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
    const { title, slug, content, excerpt, tags, status, published, published_at } = body;

    // 验证必填字段
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // 创建文章
    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || content.slice(0, 150) + '...',
        tags: tags || [],
        status: status || 'draft',
        published: published || false,
        published_at: published_at || (status === 'published' ? new Date().toISOString() : null),
        author_id: user.id,
        views: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating post:', insertError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

