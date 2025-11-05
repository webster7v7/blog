'use server';

import { createServerClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * 退出登录
 */
export async function logout() {
  const supabase = await createServerClient();
  
  // 执行退出操作
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error);
    throw new Error('退出登录失败');
  }
  
  // 清除缓存
  revalidatePath('/', 'layout');
  
  // 重定向到首页
  redirect('/');
}

