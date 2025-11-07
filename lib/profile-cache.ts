/**
 * Profile 数据缓存工具
 * 使用 RPC 函数优化用户资料页面性能
 */

import { unstable_cache } from 'next/cache';
import { createPublicClient } from './supabase';
import { CACHE_TAGS } from './cache';

// ==================== 类型定义 ====================

export interface ProfileStats {
  profile: {
    id: string;
    username: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    created_at: string;
    updated_at: string;
    role: string;
  };
  posts_count: number;
  favorites_count: number;
  likes_count: number;
}

// ==================== 缓存函数 ====================

/**
 * 获取用户资料及统计数据（带缓存）
 * 优化：从 5 次串行查询减少到 1 次 RPC 调用
 * 缓存时间：5 分钟
 * 
 * @param userId - 用户 UUID
 * @returns ProfileStats 或 null（用户不存在）
 */
export const getCachedUserProfile = unstable_cache(
  async (userId: string): Promise<ProfileStats | null> => {
    const supabase = createPublicClient();
    
    // 调用 RPC 函数
    const { data, error } = await supabase
      .rpc('get_user_profile_stats', { p_user_id: userId });

    if (error) {
      console.error('Error fetching user profile stats:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // 类型转换（RPC 返回的是 JSON）
    return data as ProfileStats;
  },
  // 缓存键（包含用户 ID）
  ['user-profile-stats'],
  {
    revalidate: 300, // 5 分钟缓存
    tags: [CACHE_TAGS.USERS], // 标签用于手动失效
  }
);

/**
 * 无缓存版本：直接调用 RPC 函数
 * 用于需要实时数据的场景（如用户自己的设置页面）
 */
export async function getUserProfileStats(userId: string): Promise<ProfileStats | null> {
  const supabase = createPublicClient();
  
  const { data, error } = await supabase
    .rpc('get_user_profile_stats', { p_user_id: userId });

  if (error) {
    console.error('Error fetching user profile stats:', error);
    return null;
  }

  return data as ProfileStats | null;
}

