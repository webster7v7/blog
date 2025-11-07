import { Folder } from 'lucide-react';
import Link from 'next/link';
import { getCachedCategories } from '@/lib/categories';
import SidebarCard from './SidebarCard';

export default async function CategoriesWidget() {
  // ⚡ 性能优化：使用缓存版本的 RPC 函数，避免 N+1 查询
  const categories = await getCachedCategories();
  
  // 限制显示前8个分类
  const displayCategories = categories.slice(0, 8);

  if (categories.length === 0) {
    return null;
  }

  return (
    <SidebarCard
      title="文章分类"
      icon={<Folder className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
    >
      <div className="space-y-2">
        {displayCategories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {category.name}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {category.posts_count || 0}
            </span>
          </Link>
        ))}
      </div>

      {categories.length > 8 && (
        <Link
          href="/categories"
          className="block mt-4 text-sm text-center text-purple-600 dark:text-purple-400 hover:underline"
        >
          查看全部分类 →
        </Link>
      )}
    </SidebarCard>
  );
}

