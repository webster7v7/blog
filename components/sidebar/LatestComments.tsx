import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { createServerClient } from '@/lib/supabase';
import SidebarCard from './SidebarCard';

export default async function LatestComments() {
  const supabase = await createServerClient();

  // 获取最新的5条评论
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      post_slug,
      created_at,
      user:profiles!comments_user_id_fkey (
        username
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <SidebarCard
      title="最新评论"
      icon={<MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
    >
      <div className="space-y-4">
        {comments.map((comment: any) => (
          <Link
            key={comment.id}
            href={`/posts/${comment.post_slug}#comment-${comment.id}`}
            className="block group"
          >
            <div className="flex gap-2">
              {/* 用户头像 */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium text-xs">
                {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* 评论内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {comment.user?.username || '匿名用户'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                  {comment.content}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SidebarCard>
  );
}

