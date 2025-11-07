/**
 * React 19资源预加载工具
 * 用于优化外部资源的DNS解析和连接建立
 */

import { prefetchDNS, preconnect } from 'react-dom';

/**
 * 预加载Supabase相关资源
 * 提前建立DNS解析和TCP连接，减少API调用延迟
 */
export function preloadSupabaseResources() {
  if (typeof window === 'undefined') return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      const origin = url.origin;
      
      // DNS预解析
      prefetchDNS(origin);
      
      // 预连接（包括TLS握手）
      preconnect(origin);
    } catch (error) {
      console.error('Failed to preload Supabase resources:', error);
    }
  }
}

/**
 * 预加载GitHub头像资源
 * 用于用户头像等外部图片资源
 */
export function preloadGitHubAvatars() {
  if (typeof window === 'undefined') return;

  try {
    // GitHub avatars域名
    prefetchDNS('https://avatars.githubusercontent.com');
    preconnect('https://avatars.githubusercontent.com');
  } catch (error) {
    console.error('Failed to preload GitHub avatars:', error);
  }
}

/**
 * 预加载所有关键外部资源
 * 在应用初始化时调用
 */
export function preloadCriticalResources() {
  preloadSupabaseResources();
  preloadGitHubAvatars();
}

