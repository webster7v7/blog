import { createServerClient, createPublicClient } from './supabase';
import { Category } from '@/types/category';
import { PostListItem } from '@/types/blog';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { CACHE_SEMI_STATIC, CACHE_TAGS } from './cache';

// ==================== React cache 请求去重 ====================
// 用于同一渲染周期内避免重复查询

/**
 * 获取所有分类（包含文章数统计）
 * 注意：此函数仍存在N+1问题，后续将用RPC函数替换
 */
export const getAllCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createServerClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // 为每个分类统计文章数
  const categoriesWithCount = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category', category.slug)
        .eq('status', 'published');

      return {
        ...category,
        posts_count: count || 0,
      };
    })
  );

  return categoriesWithCount;
});

/**
 * 根据 slug 获取单个分类（使用 RPC 函数优化）
 * ✅ 优化：从 2 次数据库查询减少到 1 次 RPC 调用
 * 性能提升：减少查询时间约 50%
 */
export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const supabase = await createServerClient();

  // ✅ 使用新的 RPC 函数，1 次查询代替原来的 2 次
  const { data, error } = await supabase
    .rpc('get_category_with_count', { p_slug: slug });

  if (error) {
    console.error('Error fetching category with RPC:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as Category;
});

/**
 * 获取指定分类下的所有文章
 */
export const getPostsByCategory = cache(async (categorySlug: string): Promise<PostListItem[]> => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at, views, tags, category, comments_count, likes_count, favorites_count')
    .eq('category', categorySlug)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }

  return data as PostListItem[];
});

// ==================== unstable_cache 服务端缓存 ====================
// 使用 RPC 函数，解决 N+1 问题

/**
 * 缓存版本：获取所有分类及文章数统计（使用RPC，无N+1）
 * 缓存时间：10分钟
 * 标签：categories, posts
 */
export const getCachedCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    
    // 使用 RPC 函数一次性获取所有数据
    const { data, error } = await supabase.rpc('get_categories_with_count');

    if (error) {
      console.error('Error fetching cached categories:', error);
      return [];
    }

    return (data || []) as Category[];
  },
  ['categories-with-count'],
  { revalidate: CACHE_SEMI_STATIC, tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.POSTS] }
);

