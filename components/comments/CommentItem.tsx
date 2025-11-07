'use client';

import { useState } from 'react';
import { CommentWithUser } from '@/types/comment';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from 'sonner';
import { Reply, Edit2, Trash2, MoreVertical } from 'lucide-react';
import CommentForm from './CommentForm';
import Link from 'next/link';
import Image from 'next/image';

interface CommentItemProps {
  comment: CommentWithUser;
  postSlug: string;
  currentUserId?: string | null;
  onUpdate: () => void;
  level?: number;
}

export default function CommentItem({
  comment,
  postSlug,
  currentUserId,
  onUpdate,
  level = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const avatarLetter = comment.user.username.charAt(0).toUpperCase();

  // 处理删除
  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      toast.success('评论已删除');
      onUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理更新
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error('评论内容不能为空');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      toast.success('评论已更新');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${level > 0 ? 'ml-4 md:ml-12' : ''}`}>
      <div className="flex gap-3 group">
        {/* 头像 - 可点击跳转到用户主页 */}
        <Link href={`/profile/${comment.user.id || comment.user_id}`} className="flex-shrink-0">
          {comment.user.avatar_url ? (
            <Image
              src={comment.user.avatar_url}
              alt={comment.user.username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-purple-400 transition-all cursor-pointer hover:scale-110"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium text-sm hover:scale-110 transition-transform cursor-pointer">
              {avatarLetter}
            </div>
          )}
        </Link>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 border border-gray-200/30 dark:border-gray-800/30">
            {/* 用户信息和操作 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.user.username}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">(已编辑)</span>
                )}
              </div>

              {/* 操作菜单 */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>

                  {showMenu && (
                      <div
                        className="absolute right-0 mt-1 w-32 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg border border-gray-200/30 dark:border-gray-800/30 py-1 z-10"
                      >
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>删除</span>
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* 评论内容 */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  rows={3}
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    disabled={loading}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            {/* 回复按钮 */}
            {!isEditing && level < 3 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>回复</span>
              </button>
            )}
          </div>

          {/* 回复表单 */}
          {showReplyForm && (
              <div className="mt-3 animate-fade-in">
                <CommentForm
                  postSlug={postSlug}
                  parentId={comment.id}
                  onSuccess={() => {
                    setShowReplyForm(false);
                    onUpdate();
                  }}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder={`回复 @${comment.user.username}...`}
                  buttonText="回复"
                />
              </div>
            )}

          {/* 嵌套回复 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply: CommentWithUser) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postSlug={postSlug}
                  currentUserId={currentUserId}
                  onUpdate={onUpdate}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

