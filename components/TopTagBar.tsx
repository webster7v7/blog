import Link from 'next/link';
import { getAllTags } from '@/lib/posts';
import { Tag } from 'lucide-react';

export default async function TopTagBar() {
  const tags = await getAllTags();

  // 如果没有标签，不显示标签栏
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-[73px] left-0 right-0 z-40 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200/20 dark:border-gray-800/20">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2">
          {/* 标签图标 */}
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm flex-shrink-0 pr-2 border-r border-gray-300 dark:border-gray-600">
            <Tag className="w-4 h-4" />
            <span>标签</span>
          </div>

          {/* 标签列表 */}
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 group"
            >
              <span>{tag.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-300">
                ({tag.count})
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

