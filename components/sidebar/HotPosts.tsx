import { TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';
import { getCachedPostsList, getPostsStats } from '@/lib/posts';
import SidebarCard from './SidebarCard';

export default async function HotPosts() {
  // 获取浏览量最高的5篇文章
  const allPosts = await getCachedPostsList();
  const statsMap = await getPostsStats();
  
  // 合并静态内容和动态统计
  const postsWithStats = allPosts.map(post => ({
    ...post,
    views: statsMap.get(post.slug)?.views || 0,
  }));
  
  const hotPosts = postsWithStats
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <SidebarCard
      title="热门文章"
      icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
    >
      <div className="space-y-3">
        {hotPosts.map((post, index) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="block group"
          >
            <div className="flex gap-3">
              {/* 排名 */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {index + 1}
              </div>

              {/* 文章信息 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Eye className="w-3 h-3" />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SidebarCard>
  );
}

