import { FileText, MessageSquare, Heart, Star } from 'lucide-react';

interface UserStats {
  posts_count: number;
  comments_count: number;
  likes_received: number;
  favorites_received: number;
}

interface UserStatsCardProps {
  stats: UserStats;
}

export default function UserStatsCard({ stats }: UserStatsCardProps) {
  const statItems = [
    {
      label: '文章',
      value: stats.posts_count,
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: '评论',
      value: stats.comments_count,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: '获赞',
      value: stats.likes_received,
      icon: Heart,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: '收藏',
      value: stats.favorites_received,
      icon: Star,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
  ];

  return (
    <div className="flex items-center gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-1.5"
            title={item.label}
          >
            <Icon className={`w-4 h-4 ${item.color}`} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

