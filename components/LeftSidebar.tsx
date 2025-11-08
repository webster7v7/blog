'use client';

import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import type { ExternalLink } from '@/types/external-link';

export default function LeftSidebar() {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/external-links');
        if (response.ok) {
          const data = await response.json();
          setLinks(data.links || []);
        }
      } catch (error) {
        console.error('Error fetching external links:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // 获取 Lucide 图标组件
  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = Icons[iconName as keyof typeof Icons];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  // 如果没有链接，不显示侧边栏
  if (!loading && links.length === 0) {
    return null;
  }

  return (
    <aside className="hidden md:block fixed left-0 top-[121px] h-[calc(100vh-121px)] w-64 z-30 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-r border-gray-200/30 dark:border-gray-800/30 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          🔗 外链导航
        </h2>
        
        <nav className="space-y-2">
          {loading ? (
            // 加载骨架屏
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </>
          ) : (
            // 外链列表
            links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 group"
              >
                {link.icon && (
                  <span className="flex-shrink-0 transition-transform group-hover:scale-110">
                    {getIcon(link.icon)}
                  </span>
                )}
                <span className="flex-1 truncate">{link.name}</span>
                <Icons.ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
              </a>
            ))
          )}
        </nav>
      </div>

      {/* 自定义滚动条样式 */}
      <style jsx global>{`
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </aside>
  );
}

