import { Tag } from 'lucide-react';
import Link from 'next/link';
import { getAllTags } from '@/lib/posts';
import SidebarCard from './SidebarCard';

export default async function TagsWidget() {
  const tags = await getAllTags();
  
  // 限制显示前10个标签
  const displayTags = tags.slice(0, 10);

  return (
    <SidebarCard
      title="热门标签"
      icon={<Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
    >
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>

      {tags.length > 10 && (
        <Link
          href="/tags"
          className="block mt-4 text-sm text-center text-purple-600 dark:text-purple-400 hover:underline"
        >
          查看全部标签 →
        </Link>
      )}
    </SidebarCard>
  );
}

