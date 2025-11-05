'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { ExternalLink } from '@/types/external-link';

interface ExternalLinkFormProps {
  link: ExternalLink | null;
  onSuccess: (link: ExternalLink) => void;
  onCancel: () => void;
}

// 常用图标列表（来自 lucide-react）
const AVAILABLE_ICONS = [
  'Link',
  'ExternalLink',
  'Github',
  'Twitter',
  'Facebook',
  'Linkedin',
  'Instagram',
  'Youtube',
  'Mail',
  'Globe',
  'Code',
  'Book',
  'BookOpen',
  'Gem',
  'Star',
  'Heart',
  'Bookmark',
  'Home',
  'Settings',
  'User',
  'Users',
  'Package',
  'Box',
  'Archive',
  'FileText',
  'Image',
  'Video',
  'Music',
  'Briefcase',
  'ShoppingCart',
];

export default function ExternalLinkForm({
  link,
  onSuccess,
  onCancel,
}: ExternalLinkFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: link?.name || '',
    url: link?.url || '',
    icon: link?.icon || '',
    order: link?.order || 0,
    is_visible: link?.is_visible !== undefined ? link.is_visible : true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.name.trim()) {
      toast.error('请输入外链名称');
      return;
    }

    if (!formData.url.trim()) {
      toast.error('请输入外链 URL');
      return;
    }

    // 验证 URL 格式
    try {
      new URL(formData.url);
    } catch {
      toast.error('请输入有效的 URL 地址');
      return;
    }

    setLoading(true);

    try {
      const url = link
        ? `/api/admin/external-links/${link.id}`
        : '/api/admin/external-links';
      const method = link ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '操作失败');
      }

      const { link: savedLink } = await response.json();
      onSuccess(savedLink);
    } catch (error: any) {
      console.error('Error saving link:', error);
      toast.error(error.message || '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 外链名称 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          外链名称 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="例如：GitHub"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={loading}
          maxLength={50}
        />
      </div>

      {/* 外链 URL */}
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          外链 URL <span className="text-red-500">*</span>
        </label>
        <input
          id="url"
          type="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://example.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          请输入完整的 URL，包括 https:// 或 http://
        </p>
      </div>

      {/* 图标选择 */}
      <div>
        <label
          htmlFor="icon"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          图标
        </label>
        <select
          id="icon"
          value={formData.icon}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={loading}
        >
          <option value="">无图标</option>
          {AVAILABLE_ICONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          从 Lucide Icons 中选择一个图标
        </p>
      </div>

      {/* 显示顺序 */}
      <div>
        <label
          htmlFor="order"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          显示顺序
        </label>
        <input
          id="order"
          type="number"
          value={formData.order}
          onChange={handleChange}
          placeholder="0"
          min="0"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          数字越小排序越靠前，也可以通过拖拽调整顺序
        </p>
      </div>

      {/* 是否显示 */}
      <div className="flex items-center gap-3">
        <input
          id="is_visible"
          type="checkbox"
          checked={formData.is_visible}
          onChange={handleChange}
          className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
          disabled={loading}
        />
        <label
          htmlFor="is_visible"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          在导航栏中显示
        </label>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>保存中...</span>
            </>
          ) : (
            <span>{link ? '更新外链' : '创建外链'}</span>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          取消
        </button>
      </div>
    </form>
  );
}

