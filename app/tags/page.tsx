import { getTagsWithCount } from '@/lib/posts';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '标签 | Webster',
  description: '所有文章标签',
};

export const revalidate = 60;

export default async function TagsPage() {
  const tagsWithCount = await getTagsWithCount();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          标签
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          共 {tagsWithCount.length} 个标签
        </p>
      </header>

      <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-8 border border-gray-200/30 dark:border-gray-800/30">
        <div className="flex flex-wrap gap-4 justify-center">
          {tagsWithCount.map(({ tag, count }) => {
            const size = Math.min(count * 0.3 + 1, 2.5);
            
            return (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="group"
              >
                <div
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-110 transition-all duration-300 flex items-center gap-2"
                  style={{ fontSize: `${size}rem` }}
                >
                  <span className="font-medium">{tag}</span>
                  <span className="text-xs opacity-75">({count})</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

