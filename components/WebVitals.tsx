'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Web Vitals性能监控组件
 * 监听核心Web指标：CLS, FID, FCP, LCP, TTFB
 * 以及页面切换性能
 */
export default function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    // 记录页面切换开始时间
    const navigationStart = performance.now();

    // 监听Web Vitals指标
    if ('PerformanceObserver' in window) {
      try {
        // 监听LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
          };
          
          const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
          console.log('[Performance] LCP:', Math.round(lcp), 'ms');
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // 监听FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
            const fid = entry.processingStart 
              ? entry.processingStart - entry.startTime 
              : 0;
            console.log('[Performance] FID:', Math.round(fid), 'ms');
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        // 监听CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as (PerformanceEntry & { value?: number })[];
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += entry.value || 0;
            }
          });
          console.log('[Performance] CLS:', clsValue.toFixed(4));
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // 清理函数
        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (error) {
        console.error('[Performance] Observer error:', error);
      }
    }

    // 监听导航性能
    if ('PerformanceNavigationTiming' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const nav = entry as PerformanceNavigationTiming;
            const ttfb = nav.responseStart - nav.requestStart;
            const fcp = nav.domContentLoadedEventEnd - nav.fetchStart;
            
            console.log('[Performance] TTFB:', Math.round(ttfb), 'ms');
            console.log('[Performance] FCP:', Math.round(fcp), 'ms');
          });
        });
        navigationObserver.observe({ type: 'navigation', buffered: true });
      } catch (error) {
        // Navigation timing not supported in all browsers
      }
    }

    // 记录页面切换完成时间
    const navigationEnd = performance.now();
    const navigationTime = navigationEnd - navigationStart;
    console.log('[Performance] Page Navigation:', Math.round(navigationTime), 'ms', pathname);
  }, [pathname]);

  return null;
}

