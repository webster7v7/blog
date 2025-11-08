'use client';

import { useState, useRef, useEffect } from 'react';
import { Link2, ExternalLink, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { ExternalLink as ExternalLinkType } from '@/types/external-link';

export default function ExternalLinksMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<ExternalLinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // 获取外链数据
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

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 获取 Lucide 图标
  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = Icons[iconName as keyof typeof Icons];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Link2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
          外链
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-xl border border-gray-200/30 dark:border-gray-800/30 py-2 z-50 max-h-[400px] overflow-y-auto animate-fade-in">
            {/* 标题 */}
            <div className="px-4 py-3 border-b border-gray-200/30 dark:border-gray-800/30">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                外链导航
              </p>
            </div>

            {/* 加载状态 */}
            {loading && (
              <div className="py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="px-4 py-3 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {/* 外链列表 */}
            {!loading && links.length > 0 && (
              <div className="py-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                  >
                    {link.icon && getIcon(link.icon)}
                    <span className="flex-1">{link.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            {/* 空状态 */}
            {!loading && links.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                暂无外链
              </div>
            )}
        </div>
      )}
    </div>
  );
}

