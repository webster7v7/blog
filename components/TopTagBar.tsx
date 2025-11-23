import Link from 'next/link';
import { getCachedCategories } from '@/lib/categories';
import { Folder } from 'lucide-react';

export default async function TopTagBar() {
  // 使用缓存版本（RPC函数，无N+1问题）
  const categories = await getCachedCategories();

  // 如果没有分类，不显示分类栏
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-[60px] md:top-[73px] left-0 right-0 z-40 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200/20 dark:border-gray-800/20">
      <nav className="max-w-7xl mx-auto px-4 md:px-6">
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
