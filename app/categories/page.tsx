import { getCachedCategories } from '@/lib/categories';
import Link from 'next/link';
import { Folder } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import type { Metadata } from 'next';

// ⚡ 性能优化：使用缓存版本的 RPC 函数，避免 N+1 查询
export const revalidate = 60;

export const metadata: Metadata = {
  title: '所有分类 | Webster',
  description: '浏览所有文章分类',
};

export default async function CategoriesPage() {
  // ⚡ 优化：从 N+1 查询改为单次 RPC 调用
  const categories = await getCachedCategories();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Breadcrumb
          items={[{ label: '分类', href: '/categories' }]}
        />
      </div>

      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          文章分类
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          按分类浏览文章，探索不同主题的内容
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="text-center py-12 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/30 dark:border-gray-800/30">
          <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            还没有分类
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {category.name}
                  </h2>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {category.posts_count || 0} 篇
                </span>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {category.description}
                </p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                /{category.slug}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

