'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

/**
 * 条件渲染的 Footer 包装组件
 * 在 Admin 页面隐藏全局 Footer（Admin 页面不需要网站统计和版权信息）
 * 
 * 隐藏规则：
 * - /admin/* - 管理后台页面（Admin 界面应该是完全独立的）
 */
export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // 在 admin 路由下不显示全局 Footer
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <Footer />;
}

