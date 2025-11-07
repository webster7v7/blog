'use client';

import { usePathname } from 'next/navigation';
import TopTagBarClient from './TopTagBarClient';

/**
 * 条件渲染的 TopTagBar 包装组件
 * 根据当前路径决定是否显示分类导航栏
 * 
 * 隐藏规则：
 * - /admin/* - 管理后台页面（已有侧边栏导航）
 */
export default function ConditionalTopTagBar() {
  const pathname = usePathname();
  
  // 在 admin 路由下不显示分类栏
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return <TopTagBarClient />;
}

