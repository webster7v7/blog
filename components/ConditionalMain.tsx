'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ConditionalMainProps {
  children: ReactNode;
}

/**
 * 条件渲染的 Main 容器组件
 * 根据路径应用不同的顶部 padding
 * 
 * 样式规则：
 * - 普通页面：pt-32（为 Header 73px + TopTagBar 52px 留空间）
 * - Admin 页面：pt-0（Admin 有自己的完整布局，从顶部开始）
 */
export default function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();
  
  // Admin 路由不需要顶部 padding（没有全局 Header 和 TopTagBar）
  const isAdmin = pathname?.startsWith('/admin');
  const paddingClass = isAdmin ? 'pt-0' : 'pt-32';
  
  return (
    <main className={`${paddingClass} min-h-screen`}>
      {children}
    </main>
  );
}

