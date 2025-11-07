'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
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

  // 图标上传相关状态
  const [iconMode, setIconMode] = useState<'lucide' | 'upload'>(
    link?.icon && (link.icon.startsWith('http://') || link.icon.startsWith('https://')) 
      ? 'upload' 
      : 'lucide'
  );
  const [uploading, setUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>(
    link?.icon && (link.icon.startsWith('http://') || link.icon.startsWith('https://'))
      ? link.icon
      : ''
  );

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

  // 处理图标上传
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);

    try {
      // 1. 压缩图片
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2, // 200KB
        maxWidthOrHeight: 200, // 200x200
        useWebWorker: true,
        fileType: 'image/webp',
      });

      // 2. 上传到服务器
      const uploadFormData = new FormData();
      uploadFormData.append('file', compressedFile);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const { url } = await response.json();

      // 3. 更新表单数据和预览
      setFormData((prev) => ({ ...prev, icon: url }));
      setIconPreview(url);
      toast.success('图标上传成功');
    } catch (error: any) {
      console.error('Error uploading icon:', error);
      toast.error(error.message || '图标上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 切换图标模式
  const handleIconModeChange = (mode: 'lucide' | 'upload') => {
    setIconMode(mode);
    if (mode === 'lucide') {
      setIconPreview('');
      setFormData((prev) => ({ ...prev, icon: '' }));
    }
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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          图标
        </label>

        {/* 图标模式切换 */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleIconModeChange('lucide')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              iconMode === 'lucide'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={loading || uploading}
          >
            Lucide 图标
          </button>
          <button
            type="button"
            onClick={() => handleIconModeChange('upload')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              iconMode === 'upload'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={loading || uploading}
          >
            自定义图片
          </button>
        </div>

        {/* Lucide 图标选择器 */}
        {iconMode === 'lucide' && (
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
        )}

        {/* 自定义图片上传 */}
        {iconMode === 'upload' && (
          <div>
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  disabled={loading || uploading}
                  className="hidden"
                />
                <div
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 
                    border-2 border-dashed border-gray-300 dark:border-gray-600 
                    rounded-lg cursor-pointer transition-colors
                    ${
                      uploading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }
                  `}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        上传中...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        点击上传图标
                      </span>
                    </>
                  )}
                </div>
              </label>

              {/* 图标预览 */}
              {iconPreview && (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
                  <img
                    src={iconPreview}
                    alt="图标预览"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              推荐尺寸：200x200px，支持 JPG、PNG、WebP，将自动压缩
            </p>
          </div>
        )}

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {iconMode === 'lucide'
            ? '从 Lucide Icons 中选择一个图标'
            : '上传自定义图标图片'}
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

