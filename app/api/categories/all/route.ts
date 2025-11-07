import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

// ⚡ 性能优化：启用缓存，60秒重新验证
export const revalidate = 60;

/**
 * GET /api/categories/all
 * 获取所有分类及文章数统计
 * 用于客户端组件（TopTagBarClient）
 */
export async function GET() {
  try {
    const supabase = createPublicClient();
    
    // 使用已有的 RPC 函数获取分类
    const { data: categories, error } = await supabase
      .rpc('get_categories_with_count');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', categories: [] },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        }
      );
    }

    return NextResponse.json(
      { categories: categories || [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', categories: [] },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  }
}
