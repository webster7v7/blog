import { FileText, MessageSquare, Eye, Heart } from 'lucide-react';
import { getCachedDashboardStats } from '@/lib/admin-cache';

export default async function AdminDashboard() {
  // ✅ 优化：使用缓存的 Dashboard 统计数据
  // 从 4 次查询 → 1 次 RPC → 缓存 60 秒
  const stats = await getCachedDashboardStats();

  const statsData = {
    postsCount: stats.posts_count,
    commentsCount: stats.comments_count,
    totalViews: stats.total_views,
    totalLikes: stats.total_likes,
  };

  const statsCards = [
    {
      title: '总文章数',
      value: statsData.postsCount,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: '总评论数',
      value: statsData.commentsCount,
      icon: MessageSquare,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      title: '总浏览量',
      value: statsData.totalViews,
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: '总点赞数',
      value: statsData.totalLikes,
      icon: Heart,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 欢迎信息 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          欢迎回来！
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          这是你的博客管理控制台
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="group backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          快捷操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/posts/new"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            <FileText className="w-5 h-5" />
            <span>写新文章</span>
          </a>
          <a
            href="/admin/posts"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
          >
            <FileText className="w-5 h-5" />
            <span>管理文章</span>
          </a>
          <a
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            <Eye className="w-5 h-5" />
            <span>预览博客</span>
          </a>
        </div>
      </div>
    </div>
  );
}

