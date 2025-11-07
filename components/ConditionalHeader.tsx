'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

/**
 * 条件渲染的 Header 包装组件
 * 在 Admin 页面隐藏全局 Header（Admin 有自己的侧边栏和移动端 Header）
 * 
 * 隐藏规则：
 * - /admin/* - 管理后台页面（已有独立的侧边栏导航和移动端 Header）
 */
export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // 在 admin 路由下不显示全局 Header
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Header />;
}

