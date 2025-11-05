'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

interface CommentFormProps {
  postSlug: string;
  parentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  buttonText?: string;
}

export default function CommentForm({
  postSlug,
  parentId = null,
  onSuccess,
  onCancel,
  placeholder = '写下你的评论...',
  buttonText = '发表评论',
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('评论内容不能为空');
      return;
    }

    if (content.length > 1000) {
      toast.error('评论内容不能超过1000个字符');
      return;
    }

    setLoading(true);

    try {
      // 检查用户是否登录
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('请先登录后再评论');
        setLoading(false);
        return;
      }

      // 创建评论
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_slug: postSlug,
          content: content.trim(),
          parent_id: parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create comment');
      }

      toast.success('评论发表成功！');
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('评论发表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={1000}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
        disabled={loading}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {content.length}/1000
        </span>
        
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              取消
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>发表中...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{buttonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

