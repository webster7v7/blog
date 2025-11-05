'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeletePostButtonProps {
  slug: string;
  title: string;
}

export default function DeletePostButton({ slug, title }: DeletePostButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 确认删除
    const confirmed = window.confirm(
      `确定要删除文章《${title}》吗？\n\n此操作不可恢复！`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除失败');
      }

      toast.success('文章删除成功');
      
      // 刷新页面以更新列表
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : '删除文章失败');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="删除"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 text-red-600 dark:text-red-400 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
      )}
    </button>
  );
}

