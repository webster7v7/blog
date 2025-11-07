'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { CommentWithUser } from '@/types/comment';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  postSlug: string;
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  // 获取当前用户
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getCurrentUser();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 获取评论列表
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?post_slug=${postSlug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 统计总评论数（包括回复）
  const countAllComments = (comments: CommentWithUser[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countAllComments(comment.replies as CommentWithUser[]) : 0);
    }, 0);
  };

  const totalComments = countAllComments(comments);

  return (
    <div className="mt-12">
      {/* 评论区标题 */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          评论
          {totalComments > 0 && (
            <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">
              ({totalComments})
            </span>
          )}
        </h2>
      </div>

      {/* 评论表单 */}
      <div className="mb-8 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
        {currentUserId ? (
          <CommentForm postSlug={postSlug} onSuccess={fetchComments} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              登录后即可发表评论
            </p>
            <button
              onClick={() => {
                // 触发登录模态框（通过事件或状态管理）
                toast.info('请点击右上角的登录按钮');
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              立即登录
            </button>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postSlug={postSlug}
              currentUserId={currentUserId}
              onUpdate={fetchComments}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/30 dark:border-gray-800/30">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            还没有评论，来抢沙发吧！
          </p>
        </div>
      )}
    </div>
  );
}

