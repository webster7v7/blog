'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Loader2, MessageSquare, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Link from 'next/link';
import Pagination from './Pagination';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_slug: string;
  profiles: {
    username: string;
    email: string;
    avatar_url: string | null;
  } | null;
  posts: {
    title: string;
    slug: string;
  } | null;
}

interface CommentsListProps {
  initialComments: Comment[];
  currentPage: number;
  totalPages: number;
}

export default function CommentsList({ initialComments, currentPage, totalPages }: CommentsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (commentId: string, content: string) => {
    // 确认删除
    const confirmed = window.confirm(
      `确定要删除这条评论吗？\n\n评论内容：${content.substring(0, 50)}...\n\n此操作不可恢复！`
    );

    if (!confirmed) return;

    setDeletingId(commentId);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除失败');
      }

      toast.success('评论删除成功');
      
      // 刷新页面以更新列表
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : '删除评论失败');
    } finally {
      setDeletingId(null);
    }
  };

  if (initialComments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          暂无评论
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200/30 dark:border-gray-800/30">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              评论内容
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              作者
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              所属文章
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              创建时间
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/30 dark:divide-gray-800/30">
          {initialComments.map((comment) => (
            <tr
              key={comment.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="max-w-md">
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                    {comment.content}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {comment.profiles?.avatar_url ? (
                    <Image
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {comment.profiles?.username || '匿名用户'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {comment.profiles?.email || '无邮箱'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {comment.posts ? (
                  <Link
                    href={`/posts/${comment.posts.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="line-clamp-1">{comment.posts.title}</span>
                  </Link>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    文章已删除
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(comment.created_at), 'yyyy-MM-dd HH:mm', {
                      locale: zhCN,
                    })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleDelete(comment.id, comment.content)}
                  disabled={deletingId === comment.id}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="删除"
                >
                  {deletingId === comment.id ? (
                    <Loader2 className="w-4 h-4 text-red-600 dark:text-red-400 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 分页 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/admin/comments"
      />
    </div>
  );
}

