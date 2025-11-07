import { createServerClient } from './supabase';
// import { unstable_cache } from 'next/cache'; // 已禁用：Edge Runtime 不支持

// 检查用户认证和权限（带缓存）
export async function checkAdminAuth() {
  const supabase = await createServerClient();
  
  // 获取用户信息
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { authorized: false, user: null, profile: null };
  }
  
  // 查询用户角色
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, user, profile: null };
  }
  
  return { authorized: true, user, profile };
}

// ============================================================
// 缓存用户权限检查（已禁用）
// ============================================================
// 
// ⚠️ 重要说明：
// getCachedUserRole 函数已被禁用，原因如下：
// 
// 1. Edge Runtime 限制：
//    - Next.js Middleware 运行在 Edge Runtime（轻量级环境）
//    - unstable_cache 需要访问文件系统（.next/cache）
//    - Edge Runtime 不支持文件系统访问
//    - 错误：Invariant: incrementalCache missing in unstable_cache
// 
// 2. 解决方案：
//    - Middleware 中直接查询数据库（无缓存）
//    - 性能影响极小（管理员路由访问频率低）
//    - 保持 Edge Runtime 兼容性
// 
// 3. 替代方案（未采用的原因）：
//    - 选项 A：内存缓存（LRU Cache）
//      理由：增加复杂度，Edge Runtime 生命周期短暂，缓存效果有限
//    - 选项 B：切换到 Node.js Runtime
//      理由：失去 Edge Runtime 性能优势
// 
// 4. API Routes 缓存：
//    - API Routes 运行在 Node.js Runtime
//    - 可以正常使用 unstable_cache
//    - 请使用 checkAdminAuth() 函数
// 
// ============================================================

/**
 * ❌ 已禁用：获取用户角色（带缓存）
 * 
 * 此函数在 Middleware 中无法使用，因为 Edge Runtime 不支持 unstable_cache。
 * 请在 Middleware 中直接查询数据库。
 * 
 * @deprecated 不要在 Middleware 中使用此函数
 * @param userId 用户 ID
 * @returns 用户角色 ('admin' | 'user' | null)
 */
/*
export const getCachedUserRole = unstable_cache(
  async (userId: string): Promise<string | null> => {
    const supabase = await createServerClient();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('[auth-cache] Error fetching user role:', error);
      return null;
    }
    
    return profile?.role || null;
  },
  ['user-role'],
  { 
    revalidate: ROLE_CACHE_TIME, // 5 分钟
    tags: ['user-permissions'] 
  }
);
*/

/**
 * ❌ 已禁用：清除用户角色缓存
 * 
 * 由于 getCachedUserRole 已禁用，此函数也不再需要。
 * 
 * @deprecated 不再需要此函数
 */
/*
export function clearUserRoleCache() {
  // 在 Next.js 15+ 中，可以使用 revalidateTag
  // import { revalidateTag } from 'next/cache';
  // revalidateTag('user-permissions');
  console.log('[auth-cache] User role cache cleared');
}
*/

