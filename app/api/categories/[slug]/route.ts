import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBySlug } from '@/lib/categories';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET /api/categories/[slug] - 获取单个分类（公开）
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // ✅ 增强缓存头（CDN缓存10分钟，过期后1小时内返回缓存+后台更新）
    return NextResponse.json(
      { category },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

