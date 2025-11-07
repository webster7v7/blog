'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Project, CreateProjectInput, ProjectCategory } from '@/types/projects';
import { PROJECT_CATEGORIES } from '@/types/projects';

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
}

export default function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectInput>({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'app',
    icon: project?.icon || '',
    file_url: project?.file_url || '',
    qr_code_url: project?.qr_code_url || '',
    web_url: project?.web_url || '',
    tags: project?.tags || [],
    is_published: project?.is_published !== undefined ? project.is_published : true,
    order_index: project?.order_index || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const handleFileUpload = async (file: File, field: 'icon' | 'file_url' | 'qr_code_url') => {
    setUploading(field);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('folder', field);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setFormData({ ...formData, [field]: data.url });
      toast.success('文件上传成功');
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = project
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects';
      const method = project ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      toast.success(project ? '项目已更新' : '项目已创建');
      onSuccess();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            项目名称 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            项目类型 *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            required
          >
            {Object.entries(PROJECT_CATEGORIES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          项目描述
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>

      {/* Icon Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">
          项目图标
        </label>
        {formData.icon ? (
          <div className="flex items-center gap-2">
            <img src={formData.icon} alt="Icon" className="w-16 h-16 object-cover rounded" />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, icon: '' })}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'icon');
              }}
              className="hidden"
              id="icon-upload"
            />
            <label
              htmlFor="icon-upload"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
            >
              <Upload size={16} />
              {uploading === 'icon' ? '上传中...' : '上传图标'}
            </label>
          </div>
        )}
      </div>

      {/* File URL (for APK, etc.) */}
      {(formData.category === 'app' || formData.category === 'miniprogram') && (
        <div>
          <label className="block text-sm font-medium mb-1">
            安装包文件
          </label>
          {formData.file_url ? (
            <div className="flex items-center gap-2">
              <a
                href={formData.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate flex-1"
              >
                {formData.file_url}
              </a>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, file_url: '' })}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".apk,.ipa,.zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'file_url');
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
              >
                <Upload size={16} />
                {uploading === 'file_url' ? '上传中...' : '上传安装包'}
              </label>
            </div>
          )}
        </div>
      )}

      {/* QR Code */}
      {formData.category === 'miniprogram' && (
        <div>
          <label className="block text-sm font-medium mb-1">
            微信小程序二维码
          </label>
          {formData.qr_code_url ? (
            <div className="flex items-center gap-2">
              <img src={formData.qr_code_url} alt="QR Code" className="w-32 h-32 object-cover rounded" />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, qr_code_url: '' })}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'qr_code_url');
                }}
                className="hidden"
                id="qr-upload"
              />
              <label
                htmlFor="qr-upload"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex items-center gap-2"
              >
                <Upload size={16} />
                {uploading === 'qr_code_url' ? '上传中...' : '上传二维码'}
              </label>
            </div>
          )}
        </div>
      )}

      {/* Web URL */}
      {formData.category === 'webpage' && (
        <div>
          <label htmlFor="web_url" className="block text-sm font-medium mb-1">
            网页链接
          </label>
          <input
            type="url"
            id="web_url"
            value={formData.web_url}
            onChange={(e) => setFormData({ ...formData, web_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1">
          标签
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="输入标签后按回车"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            添加
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">发布项目</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || uploading !== null}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : (project ? '更新项目' : '创建项目')}
        </button>
      </div>
    </form>
  );
}

