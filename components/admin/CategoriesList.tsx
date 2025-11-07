'use client';

import { useState } from 'react';
import { Edit, Trash2, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import CategoryForm from './CategoryForm';
import type { Category } from '@/types/category';

interface CategoriesListProps {
  initialCategories: Category[];
}

export default function CategoriesList({ initialCategories }: CategoriesListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDelete = async (category: Category) => {
    if (category.posts_count && category.posts_count > 0) {
      toast.error(`无法删除该分类，有 ${category.posts_count} 篇文章正在使用`);
      return;
    }

    const confirmed = window.confirm(
      `确定要删除分类 "${category.name}" 吗？此操作不可撤销！`
    );

    if (!confirmed) return;

    setDeletingId(category.id);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '删除失败');
      }

      toast.success('分类已删除！');
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      router.refresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || '删除分类失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    router.refresh();
    // 重新获取分类列表
    window.location.reload();
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">还没有分类，创建第一个吧！</p>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>新建分类</span>
        </button>
        {showCreateForm && (
          <CategoryForm onClose={() => setShowCreateForm(false)} onSuccess={handleSuccess} />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-xl p-4 border border-gray-200/30 dark:border-gray-800/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {category.name}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  disabled={deletingId === category.id}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="删除"
                >
                  {deletingId === category.id ? (
                    <Loader2 className="w-4 h-4 text-red-600 dark:text-red-400 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {category.description || '暂无描述'}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <span>URL: /{category.slug}</span>
              <span>{category.posts_count || 0} 篇文章</span>
            </div>
          </div>
        ))}
      </div>

      {/* 编辑表单 */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

