'use client';

import Link from 'next/link';
import { useState } from 'react';

interface OptimizedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean | null;
}

/**
 * 优化的Link组件 - 只在hover时预取，减少初始带宽消耗
 * 默认禁用预取，鼠标悬停时才启用
 */
export default function OptimizedLink({
  href,
  children,
  className,
  prefetch: externalPrefetch,
  ...props
}: OptimizedLinkProps) {
  const [shouldPrefetch, setShouldPrefetch] = useState(false);

  // 如果外部明确设置了prefetch，则遵循外部设置
  const finalPrefetch = externalPrefetch !== undefined ? externalPrefetch : (shouldPrefetch ? null : false);

  return (
    <Link
      href={href}
      prefetch={finalPrefetch}
      className={className}
      onMouseEnter={() => setShouldPrefetch(true)}
      {...props}
    >
      {children}
    </Link>
  );
}

