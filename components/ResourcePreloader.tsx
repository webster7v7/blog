'use client';

import { useEffect } from 'react';
import { preloadCriticalResources } from '@/lib/resource-hints';

/**
 * 资源预加载组件
 * 使用React 19的prefetchDNS和preconnect API预加载关键外部资源
 */
export default function ResourcePreloader() {
  useEffect(() => {
    // 在客户端加载后立即预加载关键资源
    preloadCriticalResources();
  }, []);

  // 此组件不渲染任何UI
  return null;
}

