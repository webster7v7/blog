'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { PersonalLink, CreatePersonalLinkInput } from '@/types/projects';

interface PersonalLinksFormProps {
  link?: PersonalLink;
  onSuccess: () => void;
}

export default function PersonalLinksForm({ link, onSuccess }: PersonalLinksFormProps) {
  const [formData, setFormData] = useState<CreatePersonalLinkInput>({
    name: link?.name || '',
    icon: link?.icon || '',
    url: link?.url || '',
    description: link?.description || '',
    order_index: link?.order_index || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      const url = link
        ? `/api/admin/personal-links/${link.id}`
        : '/api/admin/personal-links';
      const method = link ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save personal link');
      }

      toast.success(link ? '个人链接已更新' : '个人链接已创建');
      onSuccess();
    } catch (error) {
      console.error('Error saving personal link:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          名称 *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          图标 *
        </label>

        {/* 图标模式切换 */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => handleIconModeChange('lucide')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              iconMode === 'lucide'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={isSubmitting || uploading}
          >
            Lucide 图标
          </button>
          <button
            type="button"
            onClick={() => handleIconModeChange('upload')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              iconMode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            disabled={isSubmitting || uploading}
          >
            自定义图片
          </button>
        </div>

        {/* Lucide 图标输入 */}
        {iconMode === 'lucide' && (
          <>
            <input
              type="text"
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="例如: Github, Mail, MessageCircle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              查看可用图标：<a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">lucide.dev/icons</a>
            </p>
          </>
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
                  disabled={isSubmitting || uploading}
                  className="hidden"
                />
                <div
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2 
                    border-2 border-dashed border-gray-300 dark:border-gray-600 
                    rounded-lg cursor-pointer transition-colors
                    ${
                      uploading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }
                  `}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
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
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-1">
          链接地址 *
        </label>
        <input
          type="url"
          id="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          描述
        </label>
        <input
          type="text"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label htmlFor="order_index" className="block text-sm font-medium mb-1">
          排序顺序
        </label>
        <input
          type="number"
          id="order_index"
          value={formData.order_index}
          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : (link ? '更新' : '创建')}
        </button>
      </div>
    </form>
  );
}

