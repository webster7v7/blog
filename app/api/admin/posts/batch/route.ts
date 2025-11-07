import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

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

    // 解析请求体
    const { action, slugs } = await request.json();

    // 验证参数
    if (!action || !slugs || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // 限制批量操作数量
    if (slugs.length > 100) {
      return NextResponse.json(
        { error: 'Cannot process more than 100 items at once' },
        { status: 400 }
      );
    }

    // 执行批量操作
    let results;
    switch (action) {
      case 'delete':
        results = await Promise.allSettled(
          slugs.map((slug) =>
            supabase.from('posts').delete().eq('slug', slug)
          )
        );
        break;

      case 'publish':
        results = await Promise.allSettled(
          slugs.map((slug) =>
            supabase
              .from('posts')
              .update({ status: 'published', published_at: new Date().toISOString() })
              .eq('slug', slug)
          )
        );
        break;

      case 'unpublish':
        results = await Promise.allSettled(
          slugs.map((slug) =>
            supabase
              .from('posts')
              .update({ status: 'draft' })
              .eq('slug', slug)
          )
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // 统计结果
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // 收集失败的详情
    const failedDetails = results
      .map((r, index) => ({
        slug: slugs[index],
        status: r.status,
        error: r.status === 'rejected' ? r.reason : null,
      }))
      .filter((r) => r.status === 'rejected');

    return NextResponse.json({
      success: true,
      total: slugs.length,
      successful,
      failed,
      failedDetails: failed > 0 ? failedDetails : undefined,
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

