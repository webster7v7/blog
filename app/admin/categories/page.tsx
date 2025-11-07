'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Folder } from 'lucide-react';
import CategoriesList from '@/components/admin/CategoriesList';
import CategoryForm from '@/components/admin/CategoryForm';
import { toast } from 'sonner';
import type { Category } from '@/types/category';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取分类失败');
      }

      setCategories(data.categories || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || '加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-600 dark:text-purple-400 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">加载分类中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            分类管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理文章分类
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>新建分类</span>
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">总分类数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {categories.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 分类列表 */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
        <CategoriesList initialCategories={categories} />
      </div>

      {/* 创建表单 */}
      {showCreateForm && (
        <CategoryForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

