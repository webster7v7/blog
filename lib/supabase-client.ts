import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 客户端组件使用（浏览器端）
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

