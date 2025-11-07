/**
 * Admin 页面缓存层
 * 目的: 为 Admin 区域提供适当的缓存策略，提升加载速度
 * 
 * 缓存策略:
 * - Dashboard 统计: 60秒（数据变化不频繁）
 * - Posts 列表: 30秒（仅缓存默认第一页）
 * - Categories: 120秒（复用现有 RPC）
 * 
 * 注意: 使用 unstable_cache 在 Node.js Runtime 中有效
 *       不能在 Edge Runtime (middleware) 中使用
 */

import { unstable_cache } from 'next/cache';
import { createPublicClient, createServerClient } from './supabase';
import type { Post } from '@/types/blog';
import type { Category } from '@/types/category';

// ============================================================
// 类型定义
// ============================================================

/**
 * Dashboard 统计数据类型
 */
export interface DashboardStats {
  posts_count: number;
  comments_count: number;
  total_views: number;
  total_likes: number;
}

/**
 * Admin 文章列表参数
 */
export interface AdminPostsParams {
  search?: string | null;
  status?: string | null;
  sort?: string;
  page: number;
  pageSize: number;
}

/**
 * Admin 文章列表结果
 */
export interface AdminPostsResult {
  posts: Post[];
  total: number;
}

// ============================================================
// 缓存常量
// ============================================================

const CACHE_DASHBOARD_STATS = 60;  // 1分钟
const CACHE_ADMIN_POSTS = 30;      // 30秒
const CACHE_CATEGORIES = 120;      // 2分钟

// ============================================================
// 缓存函数
// ============================================================

/**
 * 获取 Dashboard 统计数据（带缓存）
 * 
 * 缓存时间: 60秒
 * 失效标签: admin-stats
 * 
 * @returns Dashboard 统计数据
 */
export const getCachedDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .rpc('get_dashboard_stats')
      .single();
    
    if (error) {
      console.error('[admin-cache] Error fetching dashboard stats:', error);
      throw error;
    }
    
    return {
      posts_count: data?.posts_count || 0,
      comments_count: data?.comments_count || 0,
      total_views: data?.total_views || 0,
      total_likes: data?.total_likes || 0,
    };
  },
  ['admin-dashboard-stats'],
  {
    revalidate: CACHE_DASHBOARD_STATS,
    tags: ['admin-stats']
  }
);

/**
 * 获取 Admin 文章列表（条件缓存）
 * 
 * 策略: 仅缓存默认排序的第一页，其他情况直接查询
 * 缓存时间: 30秒
 * 失效标签: admin-posts
 * 
 * @param params 查询参数
 * @returns 文章列表和总数
 */
export async function getAdminPosts(params: AdminPostsParams): Promise<AdminPostsResult> {
  const { search, status, sort = 'newest', page, pageSize } = params;
  
  // 仅缓存默认条件的第一页
  const isDefaultQuery = !search && !status && sort === 'newest' && page === 1;
  
  if (isDefaultQuery) {
    return getCachedAdminPostsDefault(pageSize);
  }
  
  // 非默认查询直接执行
  return getAdminPostsDirect(params);
}

/**
 * 缓存版本：获取默认条件的文章列表
 * （内部函数，通过 getAdminPosts 调用）
 */
const getCachedAdminPostsDefault = unstable_cache(
  async (pageSize: number): Promise<AdminPostsResult> => {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .rpc('get_admin_posts_list', {
        p_search: null,
        p_status: null,
        p_sort: 'newest',
        p_limit: pageSize,
        p_offset: 0
      });
    
    if (error) {
      console.error('[admin-cache] Error fetching cached posts:', error);
      throw error;
    }
    
    const posts = (data || []) as Post[];
    const total = posts.length > 0 ? Number(posts[0].total_count) : 0;
    
    return { posts, total };
  },
  ['admin-posts-default'],
  {
    revalidate: CACHE_ADMIN_POSTS,
    tags: ['admin-posts']
  }
);

/**
 * 直接查询版本：获取文章列表（无缓存）
 * （内部函数，用于非默认查询）
 */
async function getAdminPostsDirect(params: AdminPostsParams): Promise<AdminPostsResult> {
  const { search, status, sort = 'newest', page, pageSize } = params;
  const supabase = await createServerClient();
  
  const offset = (page - 1) * pageSize;
  
  const { data, error } = await supabase
    .rpc('get_admin_posts_list', {
      p_search: search || null,
      p_status: status || null,
      p_sort: sort,
      p_limit: pageSize,
      p_offset: offset
    });
  
  if (error) {
    console.error('[admin-cache] Error fetching posts:', error);
    throw error;
  }
  
  const posts = (data || []) as Post[];
  const total = posts.length > 0 ? Number(posts[0].total_count) : 0;
  
  return { posts, total };
}

/**
 * 获取分类列表及文章数（带缓存）
 * 
 * 复用现有的 get_categories_with_count() RPC
 * 缓存时间: 120秒
 * 失效标签: admin-categories
 * 
 * @returns 分类列表（含文章数）
 */
export const getCachedCategoriesWithCount = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    
    const { data, error } = await supabase
      .rpc('get_categories_with_count');
    
    if (error) {
      console.error('[admin-cache] Error fetching categories:', error);
      throw error;
    }
    
    return (data || []) as Category[];
  },
  ['admin-categories-with-count'],
  {
    revalidate: CACHE_CATEGORIES,
    tags: ['admin-categories']
  }
);

// ============================================================
// 缓存失效辅助函数
// ============================================================

/**
 * 使用方法（在 Server Actions 中）:
 * 
 * import { revalidateTag } from 'next/cache';
 * 
 * // 失效 Dashboard 统计缓存
 * revalidateTag('admin-stats');
 * 
 * // 失效文章列表缓存
 * revalidateTag('admin-posts');
 * 
 * // 失效分类缓存
 * revalidateTag('admin-categories');
 */

