import { createBrowserClient } from '@supabase/ssr';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client Component 使用（浏览器端）
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
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

