'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Eye } from 'lucide-react';

// 动态导入 Markdown 编辑器（仅客户端）
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface PostEditorProps {
  initialData?: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    tags: string[];
    status: string;
  };
  mode: 'create' | 'edit';
}

export default function PostEditor({ initialData, mode }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    tags: initialData?.tags?.join(', ') || '',
    status: initialData?.status || 'draft',
  });

  // 自动生成 slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    // 验证必填字段
    if (!formData.title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('请输入 URL 别名');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('请输入内容');
      return;
    }

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const postData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || formData.content.slice(0, 150).trim() + '...',
        tags: tagsArray,
        status,
        published: status === 'published',
        published_at: status === 'published' ? new Date().toISOString() : null,
      };

      const response = await fetch(
        mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${initialData?.slug}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save post');
      }

      toast.success(
        mode === 'create'
          ? status === 'published'
            ? '文章发布成功！'
            : '文章保存为草稿'
          : '文章更新成功！'
      );

      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          标题 *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="输入文章标题..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg font-medium"
          disabled={loading}
        />
      </div>

      {/* URL 别名 */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          URL 别名 *
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          placeholder="url-slug"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || mode === 'edit'}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {mode === 'edit' 
            ? '文章 URL 不可修改，避免破坏外部链接' 
            : `文章的 URL 地址：/posts/${formData.slug || 'your-post-slug'}`
          }
        </p>
      </div>

      {/* Markdown 编辑器 */}
      <div data-color-mode="light" className="dark:hidden">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          内容 * (Markdown)
        </label>
        <MDEditor
          value={formData.content}
          onChange={(value) => setFormData((prev) => ({ ...prev, content: value || '' }))}
          height={500}
          preview="live"
        />
      </div>
      <div data-color-mode="dark" className="hidden dark:block">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          内容 * (Markdown)
        </label>
        <MDEditor
          value={formData.content}
          onChange={(value) => setFormData((prev) => ({ ...prev, content: value || '' }))}
          height={500}
          preview="live"
        />
      </div>

      {/* 摘要 */}
      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          摘要
        </label>
        <textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
          placeholder="可选，不填写将自动截取内容前150字..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
          disabled={loading}
        />
      </div>

      {/* 标签 */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          标签
        </label>
        <input
          id="tags"
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
          placeholder="用逗号分隔，例如：JavaScript, React, Next.js"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={loading}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          disabled={loading}
        >
          取消
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存草稿</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>发布中...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>发布文章</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

