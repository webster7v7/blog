'use client';

import { useState } from 'react';
import { Trash2, Check, X, Loader2, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BatchActionsProps {
  selectedSlugs: string[];
  onClearSelection: () => void;
  onSuccess: () => void;
}

export default function BatchActions({
  selectedSlugs,
  onClearSelection,
  onSuccess,
}: BatchActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBatchAction = async (action: 'delete' | 'publish' | 'unpublish') => {
    const actionNames = {
      delete: '删除',
      publish: '发布',
      unpublish: '取消发布',
    };

    const actionName = actionNames[action];

    if (
      !window.confirm(
        `确定要${actionName} ${selectedSlugs.length} 篇文章吗？${
          action === 'delete' ? '此操作不可撤销！' : ''
        }`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/posts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, slugs: selectedSlugs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${actionName}失败`);
      }

      // 显示结果
      if (data.failed > 0) {
        toast.warning(
          `${actionName}完成：成功 ${data.successful} 篇，失败 ${data.failed} 篇`
        );
      } else {
        toast.success(`成功${actionName} ${data.successful} 篇文章！`);
      }

      // 清除选择并刷新
      onClearSelection();
      onSuccess();
      router.refresh();
    } catch (error: unknown) {
      console.error('Batch action error:', error);
      toast.error(error instanceof Error ? error.message : `${actionName}时发生错误`);
    } finally {
      setLoading(false);
    }
  };

  if (selectedSlugs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 backdrop-blur-md bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl border border-gray-200/30 dark:border-gray-800/30 p-4">
      <div className="flex items-center gap-4">
        {/* 选中数量 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-purple-900 dark:text-purple-100">
            已选择 {selectedSlugs.length} 篇
          </span>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBatchAction('publish')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>发布</span>
          </button>

          <button
            onClick={() => handleBatchAction('unpublish')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>取消发布</span>
          </button>

          <button
            onClick={() => handleBatchAction('delete')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>删除</span>
          </button>

          <button
            onClick={onClearSelection}
            disabled={loading}
            className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            取消选择
          </button>
        </div>
      </div>
    </div>
  );
}

