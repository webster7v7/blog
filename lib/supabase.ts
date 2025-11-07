import { createBrowserClient } from '@supabase/ssr';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================
// Supabase 客户端统一配置
// 目的：优化连接性能，减少不必要的开销
// ============================================================

const supabaseOptions = {
  auth: {
    persistSession: false, // 服务端不需要持久化 session
    autoRefreshToken: false, // 服务端不需要自动刷新 token
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'nextjs-blog-app/1.0', // 标识客户端便于监控
    },
  },
};

// ============================================================
// Client Component 使用（浏览器端）
// ============================================================
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ============================================================
// Public API 使用（服务端，不需要认证的公开数据）
// ⚠️ 用于 unstable_cache 内部，避免访问 cookies
// ============================================================
export function createPublicClient() {
  return createSupabaseClient<Database>(
    supabaseUrl, 
    supabaseAnonKey,
    supabaseOptions
  );
}

// Server Component 使用（服务端）
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component 中可能无法设置 cookies
        }
      },
    },
  });
}

// ============================================================
// Admin Client（仅在服务端使用，拥有完整权限）
// ⚠️ 警告：仅在受信任的服务端代码中使用，切勿暴露给客户端
// ============================================================
export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
      'Please add it to your .env.local file. ' +
      'You can find it in Supabase Dashboard > Project Settings > API > service_role key'
    );
  }
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    ...supabaseOptions, // 继承基础配置
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

