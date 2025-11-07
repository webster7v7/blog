'use client';

import Link from 'next/link';
import { Folder } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  posts_count: number;
}

/**
 * 客户端分类导航栏组件
 * 从 API 异步获取分类数据并渲染
 */
export default function TopTagBarClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 API 获取分类数据
    fetch('/api/categories/all')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  // 加载中或无分类时不显示
  if (loading || !categories || categories.length === 0) {
    return null;
  }

  return (
      <div className="fixed top-[73px] left-0 right-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-black/80 border-b border-gray-200/20 dark:border-gray-800/20">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-3">
          {/* 分类图标和标题 */}
          <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-semibold text-base flex-shrink-0 pr-4 mr-2 border-r-2 border-purple-200 dark:border-purple-800">
            <Folder className="w-5 h-5" />
            <span>分类</span>
          </div>

          {/* 分类列表 - 限制显示前6个 */}
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-full transition-all duration-300 whitespace-nowrap flex-shrink-0 group hover:opacity-90 hover:scale-105 shadow-sm"
              style={{ backgroundColor: category.color || '#8B5CF6' }}
            >
              <span>{category.name}</span>
              <span className="text-xs opacity-80">
                ({category.posts_count || 0})
              </span>
            </Link>
          ))}

          {/* 如果有更多分类，显示"更多"链接 */}
          {categories.length > 6 && (
            <Link
              href="/categories"
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0"
            >
              +{categories.length - 6} 更多
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

