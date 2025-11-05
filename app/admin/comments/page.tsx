import { createServerClient } from '@/lib/supabase';
import CommentsList from '@/components/admin/CommentsList';

export default async function AdminCommentsPage() {
  const supabase = await createServerClient();

  // 获取所有评论
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles(username, email),
      post:posts(title, slug)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          评论管理
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          管理所有用户评论
        </p>
      </div>

      {/* 评论列表 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/30 dark:border-gray-800/30 overflow-hidden">
        <CommentsList initialComments={comments || []} />
      </div>
    </div>
  );
}

